import { Component } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.scss',
})
export class VerifyCodeComponent {
  constructor(private fb: NonNullableFormBuilder) {}

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
  });
}

