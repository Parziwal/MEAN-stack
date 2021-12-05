const expect = require("chai").expect;
const PostsController = require("../../../controllers/posts");

describe("deletePost method", function () {
  it("should delete the post and return with 200 status code", function (done) {
    const fakePostModel = {
      deleteOne: (filter) => {
        expect(filter).to.be.eql({
          _id: 10,
          creator: "UserId",
        });
        return {
          then: (cb) => {
            cb({ n: 1 });
            return {
              catch: () => {},
            };
          },
        };
      },
    };

    const res = {
      status: (code) => {
        return {
          json: (post) => {
            expect(code).to.be.eql(200);
            expect(post).to.be.eql({ message: "Post deleted!" });
            done();
          },
        };
      },
    };

    const req = {
      userData: {
        userId: "UserId",
      },
      params: {
        id: 10,
      },
    };

    PostsController.deletePost({
      PostModel: fakePostModel,
    })(req, res, {});
  });

  it("should not delete the post because user is not authorized and return with 401 status code", function (done) {
    const fakePostModel = {
      deleteOne: () => {
        return {
          then: (cb) => {
            cb({ n: 0 });
            return {
              catch: () => {},
            };
          },
        };
      },
    };

    const res = {
      status: (code) => {
        return {
          json: (post) => {
            expect(code).to.be.eql(401);
            expect(post).to.be.eql({ message: "Not authorized!" });
            done();
          },
        };
      },
    };

    const req = {
      userData: {
        userId: "UserId",
      },
      params: {
        id: 10,
      },
    };

    PostsController.deletePost({
      PostModel: fakePostModel,
    })(req, res, {});
  });

  it("should fail during the post and return with 500 status code", function (done) {
    const fakePostModel = {
      deleteOne: () => {
        return {
          then: () => {
            return {
              catch: (cb) => {
                cb();
              },
            };
          },
        };
      },
    };

    const res = {
      status: (code) => {
        return {
          json: (post) => {
            expect(code).to.be.eql(500);
            expect(post).to.be.eql({ message: "Deleting a post failed!" });
            done();
          },
        };
      },
    };

    const req = {
      userData: {
        userId: "UserId",
      },
      params: {
        id: 10,
      },
    };

    PostsController.deletePost({
      PostModel: fakePostModel,
    })(req, res, {});
  });
});