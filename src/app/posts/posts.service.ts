import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { Subject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { errorHandler } from '../error/error-handler';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PostsService {
    private posts: Post[] = [];
    private postsUpdate = new Subject<{posts: Post[], postCount: number}>();

    constructor(private http: HttpClient, private router: Router) {}

    getPosts(postPerPage: number, currentPage: number) {
        let queryParams = new HttpParams();
        queryParams = queryParams.append('pagesize', postPerPage.toString());
        queryParams = queryParams.append('page', currentPage.toString());
        return this.http.get<{message: string, posts: any, maxPosts: number}>(environment.apiUrl + 'posts',
        {
            params: queryParams
        })
        .pipe(map((postData) => {
            return {posts: postData.posts.map(post => {
                return {
                    title: post.title,
                    content: post.content,
                    id: post._id,
                    imagePath: post.imagePath,
                    creator: post.creator
                };
            }), maxPosts: postData.maxPosts};
        }), catchError(errorHandler), tap((transformedData) => {
            this.posts = transformedData.posts;
            this.postsUpdate.next({posts: this.posts.slice(), postCount: transformedData.maxPosts});
        }));
    }

    addPost(title: string, content: string, image: File) {
        const postData = new FormData();
        postData.append('title', title);
        postData.append('content', content);
        postData.append('image', image, title);
        return this.http.post<{message: string, post: Post}>(environment.apiUrl + 'posts', postData)
        .pipe(catchError(errorHandler), tap(
            (responseData) => {
                // const post: Post = {id: responseData.post.id, title: title, content: content, imagePath: responseData.post.imagePath};
                // this.posts.push(post);
                // this.postsUpdate.next(this.posts.slice());
                this.router.navigate(['/']);
            }
        ));
    }

    getPostUpdateListener() {
        return this.postsUpdate.asObservable();
    }

    deletePost(postId: string) {
        return this.http.delete(environment.apiUrl + 'posts/' + postId);
    }

    getPost(id: string) {
        return this.http.get<{_id: string, title: string, content: string, imagePath: string}>(environment.apiUrl + 'posts/' + id);
    }

    updatePost(id: string, title: string, content: string, image: File | string) {
        let postData: Post | FormData;
        if(typeof(image) === 'object') {
            postData = new FormData();
            postData.append('id', id);
            postData.append('title', title);
            postData.append('content', content);
            postData.append('image', image, title);
        } else {
            postData = {
                id: id,
                title: title,
                content: content,
                imagePath: image,
                creator: null
            }
        }
        return this.http.put<{message: string}>(environment.apiUrl + 'posts/' + id, postData)
        .pipe(catchError(errorHandler), tap(
            (response) => { 
                // const oldPostIndex = this.posts.findIndex(post => post.id === id);
                // const post: Post = {
                //     id: id,
                //     title: title,
                //     content: content,
                //     imagePath: response.imagePath
                // }
                // this.posts[oldPostIndex] = post;
                // this.postsUpdate.next(this.posts.slice());
                this.router.navigate(['/']);
        }));
    }
}