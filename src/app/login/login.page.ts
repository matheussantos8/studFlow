import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { IonContent, IonItem, IonIcon, IonInput, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonItem, IonIcon, IonInput, IonButton]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  mensagemErro = '';
  modoCadastro = false; 

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  constructor() {
    addIcons({ mailOutline, lockClosedOutline });
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]] 
    });
  }

  alternarModo() {
    this.modoCadastro = !this.modoCadastro;
    this.mensagemErro = '';
    this.loginForm.reset();
  }

  async submeterFormulario() {
    if (this.loginForm.invalid) {
      this.mensagemErro = 'Por favor, preencha os campos corretamente.';
      return;
    }

    const { email, senha } = this.loginForm.value;
    this.mensagemErro = '';

    try {
      if (this.modoCadastro) {
        await this.authService.cadastrar(email, senha);
      } else {
        await this.authService.login(email, senha);
      }
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.tratarErrosFirebase(error.code);
    }
  }

  private tratarErrosFirebase(codigoErro: string) {
    switch (codigoErro) {
      case 'auth/email-already-in-use':
        this.mensagemErro = 'Este e-mail já está cadastrado.';
        break;
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        this.mensagemErro = 'E-mail ou senha incorretos.';
        break;
      case 'auth/weak-senha':
        this.mensagemErro = 'A senha deve ter pelo menos 6 caracteres.';
        break;
      default:
        this.mensagemErro = 'Ocorreu um erro. Tente novamente.';
        break;
    }
  }
}