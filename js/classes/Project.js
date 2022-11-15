class Project{
    constructor() {
        this.paths = []
        this.active_path = null
        this.id = 0;
    }

    addPath(){
        this.paths.push(new Path(this.id))
        this.id++;
    }

    selectPath(id){
        for(let i=0; i<this.paths.length; i++){
            if(this.paths[i].id===id){
                this.active_path=i
                return this.paths[i]
            }
        }
        return null
    }

    popPath(){
        this.paths.splice(this.active_path,1)
    }
}