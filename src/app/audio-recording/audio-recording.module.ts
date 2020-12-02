import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HoldableDirective } from './holdable.directive';
import { AudioRecordingComponent } from './audio-recording.component';
import { AudioPlayerComponent } from './audio-player.component';

@NgModule({
  imports: [ CommonModule ],
  declarations: [
    HoldableDirective,
    AudioRecordingComponent,
    AudioPlayerComponent
  ],
  exports: [
    HoldableDirective,
    AudioRecordingComponent,
    AudioPlayerComponent
  ]
})
export class AudioRecordingModule {}