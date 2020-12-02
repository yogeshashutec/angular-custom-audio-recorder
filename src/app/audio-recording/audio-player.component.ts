import { Component, Input, ViewChild } from '@angular/core';
import { Observable, BehaviorSubject, Subject, interval, never } from 'rxjs';
import { switchMap, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'audio-player',
  template: `
    <audio
      #audioElement
      [src]="audioUrl"
      (playing)="onPlay()"
      (pause)="onPause()"
      (ended)="onEnd()"
      (loadedmetadata)="onLoaded()"
    ></audio>
    <div class="audio-wrapper">
      <div class="play" (click)="onClick()">
        <i class="material-icons" *ngIf="!(isPlaying$ | async)">play_arrow</i>
        <i class="material-icons" *ngIf="isPlaying$ | async">pause</i>
      </div>
      <div class="time" *ngIf="isPlaying$ | async">
        {{ currentTime$ | async }} / {{ duration }}
      </div>
    </div>
  `,
  styles: [`
    .audio-wrapper {
      background: lightgreen;
      width: 100%;
      height: 50px;
      position: relative;
      border-radius: 8px;
    }
    .play, .pause {
      cursor: pointer;
      background: rgba(0,0,0,.2);
      color: white;
      width: 40px; 
      height: 40px;
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 100%;
      left: 5px;
      top: 5px;
    }
    .time {
      position: absolute;
      right: 20px;
    }
  `]
})
export class AudioPlayerComponent {
  @Input() audioUrl: string;
  @Input() duration: number;
  @ViewChild('audioElement') audioElement;
  public isPlaying$ = new BehaviorSubject<boolean>(false);
  public currentTime$ = new Observable<number>();

  onClick() {
    if (this.audioUrl) {
      if (this.isPlaying$.value) {
        this.audioElement.nativeElement.pause();
      } else {
        this.audioElement.nativeElement.play();
      }
    }
  }

  onPlay() {
    this.isPlaying$.next(true);
  }

  onPause() {
    this.isPlaying$.next(false);
  }

  onEnd() {
    this.isPlaying$.next(false);
    this._restartCurrentTime();
  }

  onLoaded() {
    this._restartCurrentTime();
  }

  private _restartCurrentTime() {
    let x = 1;
    this.currentTime$ = this.isPlaying$.pipe(
      switchMap(is => !is ? never() : interval(1000).pipe(
        map(() => x++),
        startWith(0)
      ))
    )
  }
}