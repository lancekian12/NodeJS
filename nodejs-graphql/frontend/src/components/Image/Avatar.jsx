import Image from "./Image";
import "./Avatar.css";

function Avatar({ image, size = 3 }) {
  return (
    <div
      className="avatar"
      style={{ width: `${size}rem`, height: `${size}rem` }}
    >
      <Image imageUrl={image} />
    </div>
  );
}

export default Avatar;
