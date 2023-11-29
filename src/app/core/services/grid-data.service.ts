import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class GridDataService {
  constructor() { }
  todoList=[{
    title:'aaaaaaaaaaa',
    completed: false,
    priority:0,
    orderDetailDescription:'aaaaaa',
    quantity: 1,
    unitPrice: 23,
    sumRow: ''
    },
    {
    title:'bbbbbb',
    completed: false,
    priority:1,
    orderDetailDescription:'bbbbbb',
    quantity: 3,
    unitPrice: 23,
    sumRow: ''
    },
    {
    title:'cccccc',
    completed: false,
    priority:2,
    orderDetailDescription:'ccccc',
    quantity: 1,
    unitPrice: 5,
    sumRow: ''
    },
    {
    title:'ddddd',
    completed: true,
    priority:1,
    orderDetailDescription:'dddd',
    quantity: 1,
    unitPrice: 10,
    sumRow: ''
    },
    {
    title:'eeeeeee',
    completed: false,
    priority:0,
    orderDetailDescription:'eeeee',
    quantity: 3,
    unitPrice: 2,
    sumRow: ''
    }];

    getmyData(){
      return this.todoList;
    }
    setMyData(data: any){
      this.todoList= data;
    }
  }
