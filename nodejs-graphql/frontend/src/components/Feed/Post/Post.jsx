import Button from "../../Button/Button";
import "./Post.css";

function Post({ id, author, date, title, onStartEdit, onDelete }) {
  return (
    <article className="post">
      <header className="post__header">
        <h3 className="post__meta">
          Posted by {author} on {date}
        </h3>
        <h1 className="post__title">{title}</h1>
      </header>
      {/* Uncomment below if you want image/content */}
      {/*
      <div className="post__image">
        <Image imageUrl={image} contain />
      </div>
      <div className="post__content">{content}</div>
      */}
      <div className="post__actions">
        <Button mode="flat" link={id}>
          View
        </Button>
        <Button mode="flat" onClick={onStartEdit}>
          Edit
        </Button>
        <Button mode="flat" design="danger" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </article>
  );
}

export default Post;
