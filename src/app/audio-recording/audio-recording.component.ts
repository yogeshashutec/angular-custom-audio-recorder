import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, fromEvent } from 'rxjs';
import { take, tap, pluck } from 'rxjs/operators';

declare var MediaRecorder: any;

export enum RecordingState {
  STOPPED = 'stopped',
  RECORDING = 'recording',
  FORBIDDEN = 'forbidden',
}

@Component({
  selector: 'audio-recording',
  template: `
    <ng-container *ngIf="state === 'forbidden'; else tmpl">
      Forbidden
    </ng-container>
    <ng-template #tmpl>
      <div class="audio-container" *ngFor="let audio of audioURLs">
          <audio-player
            [audioUrl]="audio.url"
            [duration]="audio.duration"
          ></audio-player>
      </div>
      <div class="record-container">
        <button
          holdable
          *ngIf="!audioURL"
          (holdTime)="onHold($event)"
          (start)="onStart()"
          (stop)="onStop()"
        >{{ state === 'recording' ? seconds : 'REC' }}</button>
      </div>
    </ng-template>    
  `,
  styles: [`
    .audio-container {
      position: relative;
      margin: 10px;
    }
    .record-container {
      position: relative;
      width: 100%;
      text-align: center;
      display: block;
    }
    [holdable] {
      outline:0;
      cursor: pointer;
      border: none;
      background: green;
      color: white;
      width: 60px; 
      height: 60px;
      position: absolute;
      display: block;
      justify-content: center;
      align-items: center;
      border-radius: 100%;
      left: 0;
      right: 0;
      top: 0;
      margin: 0 auto;
    }
  `]
})
export class AudioRecordingComponent implements OnInit {
  
  seconds: number;
  state: RecordingState = RecordingState.STOPPED;
  audioURLs = [];
  private mediaRecorder;
  private recordings$: Observable<any>;

  constructor(
    private sanitizer: DomSanitizer,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.recordings$ = fromEvent(this.mediaRecorder, 'dataavailable')
      })
      .catch(error => {
        console.log('CANNOT RECORD: ', error);
        this.state = RecordingState.FORBIDDEN;
      }); 
  }

  onHold(time) {
    this.state = RecordingState.RECORDING;
    this.seconds = Math.round(time / 1000);
  }

  onStart() {
    this.mediaRecorder.start();
    this.recordings$.pipe(
      take(1),
      pluck('data'),
      tap((data: BlobPart) => {
        let blob = new Blob([data], { type: 'audio/x-mpeg-3' });
        this.audioURLs.push(this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob)));
        this.changeDetector.detectChanges();
      })
    ).subscribe();
  }

  onStop() {
    this.state = RecordingState.STOPPED;
    this.mediaRecorder.stop();
  }
}