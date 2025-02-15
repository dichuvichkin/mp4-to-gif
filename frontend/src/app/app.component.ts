import { Component } from '@angular/core';
import { SingleFileUploadComponent } from './single-file-upload/single-file-upload.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [SingleFileUploadComponent, RouterModule]
})
export class AppComponent {
  title = 'mp4-to-gif';
}

