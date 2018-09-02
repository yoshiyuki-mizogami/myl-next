import Sortable from './sortable'
export default class Category implements Sortable{
  id:number = 1
  constructor(public name:string, public sort:number){
  }
}