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
});
