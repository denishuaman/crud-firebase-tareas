import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TodoService } from '../services/todo.service';
import { Todo } from '../models/todo';
import { DocumentReference } from '@angular/fire/firestore';
import { TodoViewModel } from '../models/todo-view-model';

@Component({
  selector: 'app-todo-form',
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.css']
})
export class TodoFormComponent implements OnInit {

  todoForm: FormGroup;
  createMode: boolean = true;
  todo: TodoViewModel;

  constructor(private formBuilder: FormBuilder, public activeModal: NgbActiveModal, private todoService: TodoService) { }

  ngOnInit() {
    this.todoForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      done: false
    });

    if (!this.createMode) {
      this.loadTodo(this.todo);
    }
  }

  loadTodo(todo) {
    this.todoForm.patchValue(todo);
  }

  saveTodo() {
    // Validar el formulario
    if (this.todoForm.invalid) {
      return;
    }
    // Enviar la informacion hacia Firebase
    if (this.createMode) {
      console.log('Creando Todo');
      let todo: Todo = this.todoForm.value;
      console.log('Todo del formulario', todo);
      todo.lastModifiedDate = new Date();
      todo.createDate = new Date();
      console.log('Todo a guardar', todo);
      this.todoService.saveTodo(todo)
        .then(response => {
          this.handleSuccessfulSaveTodo(response, todo);
          console.log('Todo guardado');
        })
        .catch(err => console.error(err));
    } else {
      console.log('Editando Todo');
      let todo: TodoViewModel = this.todoForm.value;
      todo.id = this.todo.id;
      todo.lastModifiedDate = new Date();
      this.todoService.editTodo(todo)
        .then(() => this.handleSuccessfulEditTodo(todo))
        .catch(err => console.error(err));
    }
  }

  handleSuccessfulSaveTodo(response: DocumentReference, todo: Todo) {
    // Enviar la información al todo-list
    this.activeModal.dismiss({ todo: todo, id: response.id, createMode: true });
  }

  handleSuccessfulEditTodo(todo: TodoViewModel) {
    this.activeModal.dismiss({ todo: todo, id: todo.id, createMode: false });
  }
}
