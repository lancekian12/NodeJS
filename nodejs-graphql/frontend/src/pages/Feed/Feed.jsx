import React, { useState, useEffect, Fragment } from "react";

import Post from "../../components/Feed/Post/Post";
import Button from "../../components/Button/Button";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Input from "../../components/Form/Input/Input";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import "./Feed.css";

const Feed = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [editPost, setEditPost] = useState(null);
  const [status, setStatus] = useState("");
  const [postPage, setPostPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState(null);

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    // Fetch user status
    const graphqlQuery = {
      query: `
        {
          user {
            status
          }
        }
      `,
    };
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Fetching status failed!");
        }
        setStatus(resData.data.user.status);
      })
      .catch(catchError);

    loadPosts();
  }, []);

  // =========================
  // LOAD POSTS (REST)
  // =========================
  const loadPosts = (direction) => {
    setPostsLoading(true);

    setPostPage((prevPage) => {
      const page =
        direction === "next"
          ? prevPage + 1
          : direction === "previous"
            ? prevPage - 1
            : prevPage;
      const graphqlQuery = {
        query: `
          query FetchPosts($page: Int){
            posts(page: $page) {
              posts {
                _id
                title
                content
                imageUrl
                creator {
                  name
                }
                createdAt
              }
              totalPosts
            }
          }`,
        variables: {
          page: page
        }
      };

      fetch(`http://localhost:8080/graphql`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + props.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(graphqlQuery),
      })
        .then((res) => {
          return res.json();
        })
        .then((resData) => {
          if (resData.errors) {
            throw new Error("Failed to fetch posts.");
          }
          setPosts(resData.data.posts.posts);
          setTotalPosts(resData.data.posts.totalPosts);
          setPostsLoading(false);
        })
        .catch(catchError);

      return page;
    });
  };

  // =========================
  // STATUS UPDATE
  // =========================
  const statusUpdateHandler = (event) => {
    event.preventDefault();
    const graphqlQuery = {
      query: `
        mutation UpdateUserStatus($userStatus: String!) {
          updateStatus(status: $userStatus) {
            status
          }
        }
      `,
      variables: {
        userStatus: status,
      },
    };
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors) {
          throw new Error('Fetching posts failed!');
        }
        console.log(resData);
      })
      .catch(catchError);
  };

  // =========================
  // POST EDITING
  // =========================
  const newPostHandler = () => {
    setIsEditing(true);
  };

  const startEditPostHandler = (postId) => {
    const loadedPost = posts.find((p) => p._id === postId);
    setIsEditing(true);
    setEditPost(loadedPost);
  };

  const cancelEditHandler = () => {
    setIsEditing(false);
    setEditPost(null);
  };

  const finishEditHandler = (postData) => {
    setEditLoading(true);

    const formData = new FormData();
    if (postData.image) {
      formData.append("image", postData.image);
    }
    if (editPost) {
      formData.append("oldPath", editPost.imagePath);
    }
    fetch("http://localhost:8080/post-image", {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + props.token,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((fileResData) => {
        const imageUrl = fileResData.filePath;
        let graphqlQuery = {
          query: `
            mutation CreatePost($title: String!, $content: String!, $imageUrl: String!) {
              createPost(postInput: {
                title: $title
                content: $content
                imageUrl: $imageUrl
              }) {
                _id
                title
                imageUrl
              }
            }
          `,
          variables: {
            title: postData.title,
            content: postData.content,
            imageUrl,
          },
        };
        if (editPost) {
          graphqlQuery = {
            query: `
              mutation {
                updatePost(id: "${editPost._id}", postInput: {title: "${postData.title}", content: "${
                  postData.content
                }", imageUrl: "${imageUrl}"}) {
                  _id
                  title
                  content
                  imageUrl
                  creator {
                    name
                  }
                  createdAt
                }
              }
            `,
          };
        }

        return fetch("http://localhost:8080/graphql", {
          method: "POST",
          body: JSON.stringify(graphqlQuery),
          headers: {
            Authorization: "Bearer " + props.token,
            "Content-Type": "application/json",
          },
        });
      })

      .then((res) => res.json())
      .then((resData) => {
        if (resData.errors) {
          const error = resData.errors[0];

          if (error.status === 422) {
            throw new Error("Post already exists.");
          }

          throw new Error(error.message || "Post creation failed!");
        }
      })
      .then(() => {
        setIsEditing(false);
        setEditPost(null);
        setEditLoading(false);
        loadPosts(); // 🔁 Refresh posts after create/update
      })
      .catch((err) => {
        setIsEditing(false);
        setEditPost(null);
        setEditLoading(false);
        setError(err);
      });
  };

  // =========================
  // DELETE POST
  // =========================
  const deletePostHandler = (postId) => {
    setPostsLoading(true);

    const graphqlQuery = {
      query: `
      mutation {
        deletePost(id: "${postId}")
      }
    `,
    };

    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Deleting the post failed!");
        }
        loadPosts(); // refresh feed
      })
      .catch((err) => {
        setPostsLoading(false);
        setError(err);
      });
  };
  const statusInputChangeHandler = (input, value) => {
    setStatus(value);
  };

  const errorHandler = () => {
    setError(null);
  };

  const catchError = (err) => {
    setError(err);
  };

  // =========================
  // RENDER
  // =========================
  return (
    <Fragment>
      <ErrorHandler error={error} onHandle={errorHandler} />

      <FeedEdit
        editing={isEditing}
        selectedPost={editPost}
        loading={editLoading}
        onCancelEdit={cancelEditHandler}
        onFinishEdit={finishEditHandler}
      />

      <section className="feed__status">
        <form onSubmit={statusUpdateHandler}>
          <Input
            type="text"
            placeholder="Your status"
            control="input"
            onChange={statusInputChangeHandler}
            value={status}
          />
          <Button mode="flat" type="submit">
            Update
          </Button>
        </form>
      </section>

      <section className="feed__control">
        <Button mode="raised" design="accent" onClick={newPostHandler}>
          New Post
        </Button>
      </section>

      <section className="feed">
        {postsLoading && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Loader />
          </div>
        )}

        {!postsLoading && posts.length === 0 && (
          <p style={{ textAlign: "center" }}>No posts found.</p>
        )}

        {!postsLoading && posts.length > 0 && (
          <Paginator
            onPrevious={() => loadPosts("previous")}
            onNext={() => loadPosts("next")}
            lastPage={Math.ceil(totalPosts / 2)}
            currentPage={postPage}
          >
            {posts.map((post) => (
              <Post
                key={post._id}
                id={post._id}
                author={post.creator.name}
                date={new Date(post.createdAt).toLocaleDateString("en-US")}
                title={post.title}
                image={post.imageUrl}
                content={post.content}
                onStartEdit={() => startEditPostHandler(post._id)}
                onDelete={() => deletePostHandler(post._id)}
              />
            ))}
          </Paginator>
        )}
      </section>
    </Fragment>
  );
};

export default Feed;
