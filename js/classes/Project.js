class Project{
    constructor() {
        this.paths = []
        this.active_path = null
        this.id = 0;
        this.svg_source = null;
    }

    setSvgSource(source){
        this.svg_source=source;
    }

    addPath(svgSource = null){
        this.paths.push(new Path(this.id, svgSource))
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

    async createSVG(paths_dataset) {
        if (this.svg_source === null) {
            let svg = "<svg xmlns=\"http://www.w3.org/2000/svg\">\n"
            for (let i = 0; i < paths_dataset.length; i++) {
                svg += "<path d=\"" + paths_dataset[i] + "\"/>\n"
            }
            svg += "</svg>\n"
            return svg;
        } else {
            let serializer = new XMLSerializer()
            let paths
            let svg_tag
            if(this.svg_source!==null){
                paths = await this.svg_source.getElementsByTagName("path")
                svg_tag = await this.svg_source.getElementsByTagName("svg")[0]
            }

            for(let i=0; i<this.paths.length;i++){
                if(this.svg_source!==null && this.paths[i].svgSource!==null){
                    let p = await this.svg_source.getElementById(this.paths[i].svgSource.id)
                    if(p===null){
                        for(let k=0; k<paths.length; k++){
                            if(this.paths[i].svgSource === paths[k]){
                                p = paths[k]
                                break;
                            }
                        }
                        if(p===null){
                            continue
                        }
                    }
                    p.attributes["d"].value = paths_dataset[i]
                }
                else{
                    let p = this.svg_source.createElement("path")
                    p.id = Math.floor(Date.now() / 1000) + this.paths[i].id
                    p.setAttribute("d", paths_dataset[i])
                    svg_tag.appendChild(p)
                }

            }
            console.debug("Dopo", serializer.serializeToString(this.svg_source))
            return serializer.serializeToString(this.svg_source)
        }

    }
}