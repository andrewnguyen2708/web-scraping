const express = require("express");
const app = express();
const port = 3000;
const http = require("http");
// Create the request body
const postData = JSON.stringify({
  page: "1",
});

const options = {
  hostname: "online.gov.vn",
  path: "/WebDetails",
  method: "GET",
  // headers: {
  //   "Content-Type": "application/x-www-form-urlencoded",
  //   "Content-Length": Buffer.byteLength(postData),
  // },
};

app.get("/", (req, res) => {
  const makePost = () => {
    let data = "";

    const request = http.request(options, (response) => {
      response.setEncoding("utf8");

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        console.log(data);
        res.send(data);
      });
    });

    request.on("error", (error) => {
      console.error(error);
    });

    // Write data to the request body
    // request.write(postData);

    request.end();
  };

  makePost();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
