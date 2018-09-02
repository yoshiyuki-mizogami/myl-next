export default class Config{
  config:string;
  get data(){
    return JSON.parse(this.config)
  }
  set data(v){
    this.config = JSON.stringify(v)
  }
}