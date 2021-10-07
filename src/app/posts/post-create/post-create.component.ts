import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from './mime-type.validator';
import { Observable } from 'rxjs';
import { Post } from '../post.model';

@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css']
})

export class PostCreateComponent implements OnInit {
    private mode = 'create';
    private postId: string;
    isLoading = false;
    form: FormGroup;
    imagePreview: string;
    errorMessage: string = '';

    constructor(private postsService: PostsService, private route: ActivatedRoute) {}
   
    ngOnInit(): void {
        this.form = new FormGroup({
            title: new FormControl(null, [Validators.required, Validators.minLength(3)]),
            content: new FormControl(null, [Validators.required]),
            image: new FormControl(null, [Validators.required], [mimeType])
        });
        this.route.paramMap.subscribe((paramMap: ParamMap) => {
            if(paramMap.has('postId')) {
                this.mode = 'edit';
                this.postId = paramMap.get('postId');
                this.isLoading = true;
                this.postsService.getPost(this.postId).subscribe(postData => {
                    this.isLoading = false;
                    this.imagePreview = postData.imagePath;
                    this.form.setValue({
                        title: postData.title,
                        content: postData.content,
                        image: postData.imagePath
                    });
                }, error => {
                    this.errorMessage = error;
                });

            } else {
                this.mode = 'create';
                this.postId = null;
            }
        });
    }

    onSavePost() {
        this.form.get('image').markAsTouched();
        if(this.form.invalid) {
            return;
        }

        let editPostObs: Observable<{message: string} | {message: string, post: Post}>;
        this.isLoading = true;
        if(this.mode === 'create') {
            editPostObs = this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
        } else {
            editPostObs = this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
        }
        
        editPostObs.subscribe((response) => {
            this.form.reset();
            this.isLoading = false;
        }, error => {
            this.isLoading = false;
            this.errorMessage = error;
        });
    }

    onImagePicked(event: Event) {
        this.form.get('image').markAsTouched();

        const file = (event.target as HTMLInputElement).files[0];
        this.form.patchValue({image: file});
        this.form.get('image').updateValueAndValidity();
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
    }
}