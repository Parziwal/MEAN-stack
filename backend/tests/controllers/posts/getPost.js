const expect = require("chai").expect;
const PostsController = require("../../../controllers/posts");

describe("getPost method", function () {
  it("should get the post from db and return with 200 status code", function (done) {
    const fakePostModel = {
      findById: (id) => {
        expect(id).to.be.eql(10);
        return {
          then: (cb) => {
            cb("mypost");
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
            expect(post).to.be.eql("mypost");
            done();
          },
        };
      },
    };

    const req = {
      params: {
        id: 10,
      },
    };

    PostsController.getPost({
      PostModel: fakePostModel,
    })(req, res, {});
  });

  it("should not find the post and return with 404 status code", function (done) {
    const fakePostModel = {
      findById: () => {
        return {
          then: (cb) => {
            cb(undefined);
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
            expect(code).to.be.eql(404);
            expect(post).to.be.eql({ message: "Post not found!" });
            done();
          },
        };
      },
    };

    const req = {
      params: {
        id: 10,
      },
    };

    PostsController.getPost({
      PostModel: fakePostModel,
    })(req, res, {});
  });

  it("should fail when getting the post and return with 500 status code", function (done) {
    const fakePostModel = {
      findById: () => {
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
            expect(post).to.be.eql({ message: "Getting the post failed!" });
            done();
          },
        };
      },
    };

    const req = {
      params: {
        id: 10,
      },
    };

    PostsController.getPost({
      PostModel: fakePostModel,
    })(req, res, {});
  });
});
