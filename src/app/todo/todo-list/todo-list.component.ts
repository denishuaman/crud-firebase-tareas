import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { TodoService } from '../services/todo.service';
import { TodoViewModel } from '../models/todo-view-model';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {

  constructor(private modalService: NgbModal, private todoServie: TodoService) { }

  todos: TodoViewModel[] = [];

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    this.todoServie.getTodos().subscribe(response => {
      this.todos = [];
      response.docs.forEach(value => {
        const data = value.data();
        const id = value.id;
        const todo: TodoViewModel = {
          id: id,
          title: data.title,
          description: data.description,
          done: data.done,
          lastModifiedDate: data.lastModifiedDate.toDate()
        };
        this.todos.push(todo);
      });
    });
  }

  clickAddTodo() {
    const modal = this.modalService.open(TodoFormComponent);
    modal.result.then(
      this.handleModalTodoFormClose.bind(this),
      this.handleModalTodoFormClose.bind(this)
    );
  }
  handleModalTodoFormClose(response) {
    if (response === Object(response)) {
      if (response.createMode) {
        response.todo.id = response.id;
        this.todos.unshift(response.todo);
        console.log('Todos', this.todos);
      } else {
        let index = this.todos.findIndex(value => value.id == response.id);
        this.todos[index] = response.todo;
      }
    }
  }

  checkedDone(index: number) {
    const newDoneValue = !this.todos[index].done;
    const currentDate = new Date();
    this.todos[index].done = newDoneValue;
    const obj = { done: newDoneValue, lastModifiedDate: currentDate };
    const id = this.todos[index].id;
    this.todoServie.editTodoPartial(id, obj);
  }

  hendleEditClick(todo: TodoViewModel) {
    const modal = this.modalService.open(TodoFormComponent);
    modal.result.then(
      this.handleModalTodoFormClose.bind(this),
      this.handleModalTodoFormClose.bind(this)
    );
    modal.componentInstance.createMode = false;
    modal.componentInstance.todo = todo;
  }

  hendleDeleteClick(todoId: string, index: number) {
    this.todoServie.deleteTodo(todoId)
      .then(() => {
        this.todos.splice(index, 1);
      })
      .catch(err => console.error(err));
  }
}
