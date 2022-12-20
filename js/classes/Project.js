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

    pathExists(id){
        for(let i=0; i<this.paths.length; i++){
            if(this.paths[i].id===id){
                return true
            }
        }
        return false
    }

    createPathHtml(container_id){
        let container = document.getElementById(container_id)
        container.innerHTML = "";
        for(let i=0; i<this.paths.length; i++){
            this.paths[i].createHTML(container)
        }
    }

    popPath(){
        this.paths.splice(this.active_path,1)
    }

    switchPath(id, up){
        let target = null
        let idx=0
        for(idx; idx<this.paths.length; idx++){
            if(this.paths[idx].id===id){
                target = this.paths[idx]
                break;
            }
        }
        if(!target){
            return;
        }
        let newIdx;
        if(up){
            newIdx = idx-1;
        }
        else{
            newIdx = idx+1;
        }
        if(newIdx<0||newIdx>=this.paths.length){
            return;
        }
        try{
            let tmp = this.paths[newIdx]
            this.paths[newIdx] = target
            this.paths[idx] = tmp
        } catch (e) {

        }
        this.selectPath(id)
        let current = document.getElementById("current_path")
        current.innerText = "Current path is #"+(id).toString();
    }

    createSVG(paths_dataset){
        let svg = "<svg xmlns=\"http://www.w3.org/2000/svg\">\n"
        for(let i = 0; i<paths_dataset.length; i++){
            svg += "<path d=\""+ paths_dataset[i]+"\"/>\n"
        }
        svg+="</svg>\n"
        return svg;
    }
}