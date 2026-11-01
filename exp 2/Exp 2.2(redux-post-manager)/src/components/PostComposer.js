import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPost } from "../redux/postsSlice";
import { changePlatform } from "../redux/platformSlice";

function PostComposer() {
  const dispatch = useDispatch();

  const platform = useSelector(
    (state) => state.platform.selectedPlatform
  );

  const limits = useSelector(
    (state) => state.platform.limits
  );

  const limit = limits[platform];

  const [post, setPost] = useState("");

  const savePost = () => {
    if (post.trim() === "") {
      alert("Please write something!");
      return;
    }

    dispatch(
      addPost({
        id: Date.now(),
        platform,
        content: post,
      })
    );

    setPost("");
  };

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>
        Redux Post Manager
      </h1>

      <label>
        <b>Select Platform</b>
      </label>

      <br />
      <br />

      <select
        value={platform}
        onChange={(e) =>
          dispatch(changePlatform(e.target.value))
        }
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <option>Twitter</option>
        <option>LinkedIn</option>
        <option>Instagram</option>
      </select>

      <br />
      <br />

      <textarea
        rows="6"
        value={post}
        placeholder="Write your post..."
        onChange={(e) => setPost(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
          fontSize: "16px",
        }}
      />

      <p>
        <b>
          Characters : {post.length}/{limit}
        </b>
      </p>

      {post.length > limit ? (
        <p style={{ color: "red", fontWeight: "bold" }}>
          Character Limit Exceeded
        </p>
      ) : (
        <p style={{ color: "green", fontWeight: "bold" }}>
          Ready To Post
        </p>
      )}

      <button
        onClick={savePost}
        style={{
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Save Post
      </button>
    </div>
  );
}

export default PostComposer;