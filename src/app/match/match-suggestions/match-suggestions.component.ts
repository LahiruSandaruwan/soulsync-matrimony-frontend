import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-match-suggestions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-suggestions.component.html',
  styleUrls: ['./match-suggestions.component.scss']
})
export class MatchSuggestionsComponent {
  constructor() {}
}
