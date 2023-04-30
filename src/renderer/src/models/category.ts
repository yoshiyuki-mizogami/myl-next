import {Sortable} from './sortable'
export default class Category implements Sortable{
  id!:number
  color?:RGB
  constructor(public name:string, public sort:number){
  }
}