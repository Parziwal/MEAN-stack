import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit, OnDestroy {
    posts: Post[] = [];
    isLoading = false;
    totalPosts = 0;
    postsPerPage = 2;
    pageSizeOptions = [1, 2, 5, 10];
    currentPage = 1;
    userisAuthenticated = false;
    userId: string;
    errorMessage: string = '';
    private postSub: Subscription;
    private authStatusSubs: Subscription;

    constructor(private postsService: PostsService, private authService: AuthService) {}

    ngOnInit(): void {
        this.isLoading = true;
        this.getPostsFromServer();
        this.postSub = this.postsService.getPostUpdateListener().subscribe(
            (postData: {posts: Post[], postCount: number}) => {
                this.totalPosts = postData.postCount;
                this.posts = postData.posts;
            }
        );

        this.userId = this.authService.getUserId();
        this.authStatusSubs = this.authService.getAuthStatusListener().subscribe(
            (isAuthenticated) => {
                this.userisAuthenticated = isAuthenticated;
                this.userId = this.authService.getUserId();
            }
        )
    }

    ngOnDestroy(): void {
        this.postSub.unsubscribe();
        this.authStatusSubs.unsubscribe();
    }

    onDelete(postId: string) {
        this.isLoading = true;
        this.postsService.deletePost(postId).subscribe(
            () => {
                if(this.currentPage === Math.ceil(this.totalPosts / this.postsPerPage)
                    && (this.totalPosts - Math.floor(this.totalPosts / this.postsPerPage) * this.postsPerPage === 1 || this.postsPerPage === 1)
                    && this.currentPage !== 1) {
                    this.currentPage -= 1;
                }
                this.getPostsFromServer();
            },
            error => {
                this.isLoading = false;
                this.errorMessage = error;
            }
        );
    }

    onChangedPage(pageData: PageEvent) {
        this.isLoading = true;
        this.currentPage = pageData.pageIndex + 1;
        this.postsPerPage = pageData.pageSize;
        this.getPostsFromServer();
    }

    private getPostsFromServer() {
        this.postsService.getPosts(this.postsPerPage, this.currentPage).subscribe(
            response => {
                this.isLoading = false;
            },
            error => {
                this.isLoading = false;
                this.errorMessage = error;
        });
    }
}