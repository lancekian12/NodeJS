import React, { useState, useEffect, Fragment, useRef } from "react";
import { io } from "socket.io-client";

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

  const socketRef = useRef(null);

  // =========================
  // SOCKET + INITIAL LOAD
  // =========================
  useEffect(() => {
    socketRef.current = io("http://localhost:8080", {
      auth: {
        token: props.token,
      },
    });

    socketRef.current.on("connect", () => {
      console.log("🔌 Socket connected:", socketRef.current.id);
    });

    socketRef.current.on("posts", (data) => {
      if (data.action === "create") {
        setPosts((prevPosts) => {
          if (prevPosts.some((p) => p._id === data.post._id)) {
            return prevPosts;
          }
          return [data.post, ...prevPosts];
        });
      }

      if (data.action === "update") {
        setPosts((prevPosts) =>
          prevPosts.map((p) => (p._id === data.post._id ? data.post : p)),
        );
      }

      if (data.action === "delete") {
        setPosts((prevPosts) => prevPosts.filter((p) => p._id !== data.postId));
      }
    });

    // Fetch user status
    fetch("URL", {
      headers: { Authorization: "Bearer " + props.token },
    })
      .then((res) => {
        if (res.status !== 200) throw new Error("Failed to fetch user status.");
        return res.json();
      })
      .then((resData) => setStatus(resData.status))
      .catch(catchError);

    loadPosts();

    return () => {
      socketRef.current.disconnect();
    };
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

      fetch(`http://localhost:8080/feed/posts?page=${page}`, {
        headers: {
          Authorization: "Bearer " + props.token,
        },
      })
        .then((res) => {
          if (res.status !== 200) throw new Error("Failed to fetch posts.");
          return res.json();
        })
        .then((resData) => {
          setPosts(resData.posts);
          setTotalPosts(resData.totalItems);
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
    fetch("URL", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + props.token,
      },
      body: JSON.stringify({ status }),
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201)
          throw new Error("Can't update status!");
        return res.json();
      })
      .catch(catchError);
  };

  // =========================
  // POST EDITING
  // =========================
  const newPostHandler = () => setIsEditing(true);

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

    let url = "http://localhost:8080/feed/post";
    let method = "POST";

    if (editPost) {
      url = `http://localhost:8080/feed/post/${editPost._id}`;
      method = "PUT";
    }

    const formData = new FormData();
    formData.append("title", postData.title);
    formData.append("content", postData.content);
    if (postData.image) {
      formData.append("image", postData.image);
    }

    fetch(url, {
      method,
      body: formData,
      headers: {
        Authorization: "Bearer " + props.token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201)
          throw new Error("Creating or editing post failed!");
        return res.json();
      })
      .then(() => {
        // Socket.IO handles UI updates
        setIsEditing(false);
        setEditPost(null);
        setEditLoading(false);
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

    fetch(`http://localhost:8080/feed/post/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + props.token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201)
          throw new Error("Deleting post failed!");
        return res.json();
      })
      .then(() => setPostsLoading(false))
      .catch((err) => {
        setPostsLoading(false);
        setError(err);
      });
  };

  const statusInputChangeHandler = (input, value) => setStatus(value);
  const errorHandler = () => setError(null);
  const catchError = (err) => setError(err);

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
