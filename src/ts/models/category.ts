import Sortable from './sortable'
export default class Category implements Sortable{
  id?:number
  constructor(public name:string, public sort:number){
  }
}