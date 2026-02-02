import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import Image from "../../../components/Image/Image";
import "./SinglePost.css";

const SinglePost = (props) => {
  const { postId } = useParams();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const graphqlQuery = {
      query: `
    query GetPost($id: ID!) {
      post(id: $id) {
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
      variables: {
        id: postId,
      },
    };
    fetch(`http://localhost:8080/graphql`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + props.token,
        "Content-Type": "application/json", // optional for GET
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Failed to fetch post");
        }
        setTitle(resData.data.post.title);
        setAuthor(resData.data.post.creator.name);
        setImage(resData.data.post.imageUrl);
        setDate(
          new Date(resData.data.post.createdAt).toLocaleDateString("en-US"),
        );
        setContent(resData.data.post.content);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [postId]);

  return (
    <section className="single-post">
      <h1>{title}</h1>
      <h2>
        Created by {author} on {date}
      </h2>
      <div className="single-post__image">
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            maxHeight: "30rem",
            objectFit: "contain",
          }}
        />
      </div>
      <p>{content}</p>
    </section>
  );
};

export default SinglePost;
