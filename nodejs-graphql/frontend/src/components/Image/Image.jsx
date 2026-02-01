import "./Image.css";

function Image({ imageUrl, contain = false, left = false }) {
  return (
    <div
      className="image"
      style={{
        backgroundImage: `url('${imageUrl}')`,
        backgroundSize: contain ? "contain" : "cover",
        backgroundPosition: left ? "left" : "center"
      }}
    />
  );
}

export default Image;
