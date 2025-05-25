import { Component } from '@angular/core';
import { AutoCompleteElement2 } from './auto-complete-ele-2/auto-complete-ele-2';
import { AutoCompleteElement1 } from './auto-complete-ele-1/auto-complete-ele-1';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AutoCompleteElement1, AutoCompleteElement2],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angular-google-map-places';
}
