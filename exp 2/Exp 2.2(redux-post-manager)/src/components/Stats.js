import React from "react";
import { useSelector } from "react-redux";

import {
  selectTotalPosts,
  selectTwitterPosts,
  selectLinkedInPosts,
  selectInstagramPosts,
} from "../redux/selectors";   // If your file is selector.js

function Stats() {

  const total = useSelector(selectTotalPosts);
  const twitter = useSelector(selectTwitterPosts);
  const linkedin = useSelector(selectLinkedInPosts);
  const instagram = useSelector(selectInstagramPosts);

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderRadius: "10px",
      }}
    >
      <h2>Statistics</h2>

      <p>Total Posts : {total}</p>
      <p>Twitter : {twitter.length}</p>
      <p>LinkedIn : {linkedin.length}</p>
      <p>Instagram : {instagram.length}</p>
    </div>
  );
}

export default React.memo(Stats);