import { HttpClient } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PostListComponent } from './post-list.component';
import { DebugElement, Type } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth/auth.service';
import { PostsService } from '../posts.service';
import { of } from 'rxjs';
import { MatExpansionPanel } from '@angular/material/expansion';

describe('PostListComponent', () => {
  let component: PostListComponent;
  let fixture: ComponentFixture<PostListComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let postsServiceSpy: jasmine.SpyObj<PostsService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', {
      getUserId: of(10),
      getAuthStatusListener: of(true)
    });
    postsServiceSpy = jasmine.createSpyObj('PostsService', {
      getPostUpdateListener: of(
        {
          posts: [{
            id: '10',
            title: 'PostTitle',
            content: 'PostContent',
            imagePath: 'postservice/image',
            creator: "UserId"
          }],
          postCount: 1
        }
      ),
      deletePost: of(),
      getPosts: of({
        posts: [{
        id: '10',
        title: 'PostTitle',
        content: 'PostContent',
        imagePath: 'postservice/image',
        creator: "UserId"
      }]})
    });

    await TestBed.configureTestingModule({
      declarations: [ PostListComponent ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: PostsService, useValue: postsServiceSpy },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the posts and pageCount', () => {
    expect(postsServiceSpy.getPosts).toHaveBeenCalled();
    expect(postsServiceSpy.getPostUpdateListener).toHaveBeenCalled();
    expect(component.posts).toEqual([{
      id: '10',
      title: 'PostTitle',
      content: 'PostContent',
      imagePath: 'postservice/image',
      creator: "UserId"
    }]);
    expect(component.totalPosts).toBe(1);
  });

  it('should show the post', () => {
    const bannerElement: HTMLElement = fixture.nativeElement;
    const matPanelTitle = bannerElement.querySelector('mat-panel-title')!;
    const p = bannerElement.querySelector('mat-expansion-panel p')!;
    const img = bannerElement.querySelector('.post-image img')! as HTMLImageElement;

    expect(component.isLoading).toBe(false);
    expect(component.posts.length).toBeGreaterThan(0);
    expect(matPanelTitle.textContent).toContain('PostTitle');
    expect(p.textContent).toContain('PostContent');
    expect(img.src).toContain('postservice/image');
  });

  it('should call deletePost when Delete button clicked', () => {
    component.userisAuthenticated = true;
    component.userId = "UserId";
    fixture.detectChanges();

    const bannerElement: HTMLElement = fixture.nativeElement;
    const deleteButton = bannerElement.querySelector('button')! as HTMLButtonElement;
    deleteButton.click();
    
    expect(postsServiceSpy.deletePost).toHaveBeenCalled();
  });
});
