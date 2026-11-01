import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deletePost } from "../redux/postsSlice";

function DraftList() {
  const posts = useSelector((state) => state.posts.posts);
  const dispatch = useDispatch();

  // Memoize sorted posts
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => b.id - a.id);
  }, [posts]);

  return (
    <div>
      <h2>Saved Posts</h2>

      {sortedPosts.length === 0 ? (
        <p>No Posts Available</p>
      ) : (
        sortedPosts.map((post) => (
          <div
            key={post.id}
            style={{
              backgroundColor: "#f8f9fa",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "10px",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h4>{post.platform}</h4>

            <p>{post.content}</p>

            <button
              onClick={() => dispatch(deletePost(post.id))}
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                padding: "8px 15px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default React.memo(DraftList);