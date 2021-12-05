import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { asyncData, asyncError } from '../test/async-observable-helpers';
import { PostsService } from './posts.service';
import { environment } from 'src/environments/environment';

describe('PostsService', () => {
  let service: PostsService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'delete']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    service = new PostsService(httpClientSpy, routerSpy);
  });

  it('should return expected post (HttpClient called once)', (done: DoneFn) => {
    const expectedPost = {
      _id: '10',
      title: 'PostTitle',
      content: 'PostContent',
      imagePath: 'postservice/image',
    };

    httpClientSpy.get.and.returnValue(asyncData(expectedPost));

    service.getPost('10').subscribe((post) => {
      expect(post).toEqual(expectedPost, 'expected post');
      done();
    }, done.fail);
    expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
  });

  it('should return an error when the server doesnt find the post and returns a 404', (done: DoneFn) => {
    const errorResponse = new HttpErrorResponse({
      error: 'test 404 error',
      status: 404,
      statusText: 'Not Found',
    });

    httpClientSpy.get.and.returnValue(asyncError(errorResponse));

    service.getPost('10').subscribe(
      (post) => done.fail('expected an error, not post'),
      (error) => {
        expect(error.error).toContain('test 404 error');
        done();
      }
    );
  });

  it('should create a post (HttpClient called once)', (done: DoneFn) => {
    const expectedResponse = {
      message: "Post created!",
      post: {
        id: '10',
        title: 'PostTitle',
        content: 'PostContent',
        imagePath: 'postservice/image',
        creator: "UserId"
      }
    };
    const imageFile = new File([], "Test");
    const expectedPostData = new FormData();
    expectedPostData.append('title', expectedResponse.post.title);
    expectedPostData.append('content', expectedResponse.post.content);
    expectedPostData.append('image', imageFile, "Test");

    httpClientSpy.post.withArgs(environment.apiUrl + 'posts', expectedPostData).and.returnValue(asyncData(expectedResponse));

    service.addPost('PostTitle', 'PostContent', imageFile).subscribe((response) => {
      expect(response).toEqual(expectedResponse, 'expected post with a message');
      expect(routerSpy.navigate.calls.count()).toBe(1, 'one call');
      done();
    }, done.fail);
    expect(httpClientSpy.post.calls.count()).toBe(1, 'one call');
  });

  it('should return an error when the server fails creating the post and returns a 500', (done: DoneFn) => {
    const errorResponse = new HttpErrorResponse({
      error: 'test 500 error',
      status: 500,
      statusText: 'Internal Server Error',
    });
    const imageFile = new File([], "Test");

    httpClientSpy.post.and.returnValue(asyncError(errorResponse));

    service.addPost('PostTitle', 'PostContent', imageFile).subscribe(
      (response) => done.fail('expected an error'),
      (error) => {
        expect(error.error).toContain('test 500 error');
        done();
      }
    );
    expect(httpClientSpy.post.calls.count()).toBe(1, 'one call');
  });

  it('should delete the post (HttpClient called once)', (done: DoneFn) => {
    httpClientSpy.delete.withArgs(environment.apiUrl + 'posts/10').and.returnValue(asyncData(null));

    service.deletePost('10').subscribe(() => {
      done();
    }, done.fail);
    expect(httpClientSpy.delete.calls.count()).toBe(1, 'one call');
  });

  it('should return an error when the server fails deleting the post and returns a 500', (done: DoneFn) => {
    const errorResponse = new HttpErrorResponse({
      error: 'test 500 error',
      status: 500,
      statusText: 'Internal Server Error',
    });

    httpClientSpy.delete.and.returnValue(asyncError(errorResponse));

    service.deletePost('10').subscribe(
      (post) => done.fail('expected an error'),
      (error) => {
        expect(error.error).toContain('test 500 error');
        done();
      }
    );
  });
});
