class Project{
    constructor() {
        this.paths = []
        this.active_path = null
        this.id = 0;
        this.svg_source = null;
        this.viewbox = {xmax:1, xmin:0, ymax:1, ymin:0}
    }

    setSvgSource(source){
        this.svg_source=source;
    }

    addPath(svgSource = null, numPoints){
        this.paths.push(new Path(this.id, svgSource, numPoints))
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
        for(let i=this.paths.length-1; i>=0; i--){
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
    }

    purge_transforms(){
        let elements = this.svg_source.querySelectorAll("path, ellipse, rect, circle, line, polyline, polygon, g")
        for(let i = 0; i<elements.length; i++){
            elements[i].removeAttribute("transform")
        }
    }

    async createSVG(paths_dataset) {
        if (this.svg_source === null) {
            let svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width="${this.viewbox.xmax}" height="${this.viewbox.ymax}" viewBox="${this.viewbox.xmin} ${this.viewbox.ymin} ${this.viewbox.xmax} ${this.viewbox.ymax}">\n`
            for (let i = 0; i < paths_dataset.length; i++) {
                svg += "<path d=\"" + paths_dataset[i] + "\" stroke='"+((this.paths[i].borderTransparent) ? "transparent" : this.paths[i].strokeColor)+"' fill='"+((this.paths[i].fillTransparent) ? "transparent" : this.paths[i].fillColor)+"' />\n"
            }
            svg += "</svg>\n"
            return svg;
        } else {
            let serializer = new XMLSerializer()
            let paths
            let svg_tag
            if(this.svg_source!==null){
                this.purge_transforms()
                paths = await this.svg_source.querySelectorAll("path, ellipse, rect, circle, line, polyline, polygon")
                svg_tag = await this.svg_source.getElementsByTagName("svg")[0]
                svg_tag.setAttribute("width", this.viewbox.xmax)
                svg_tag.setAttribute("height", this.viewbox.ymax)
                svg_tag.setAttribute("viewBox", `${this.viewbox.xmin} ${this.viewbox.ymin} ${this.viewbox.xmax} ${this.viewbox.ymax}`)
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
                            p = this.svg_source.createElement("path")
                            svg_tag.appendChild(p)
                        }
                    }
                    if(p.tagName==="path"){
                        p.setAttribute("d", paths_dataset[i])
                        p.setAttribute("stroke", ((this.paths[i].borderTransparent) ? "transparent" : this.paths[i].strokeColor))
                        p.setAttribute("fill", ((this.paths[i].fillTransparent) ? "transparent" : this.paths[i].fillColor))
                    }
                    else{
                        let tmp = this.svg_source.createElement("path", "http://www.w3.org/2000/svg")
                        tmp.removeAttribute("xmlns")
                        tmp.setAttribute("d", paths_dataset[i])
                        tmp.setAttribute("stroke", ((this.paths[i].borderTransparent) ? "transparent" : this.paths[i].strokeColor))
                        tmp.setAttribute("fill", ((this.paths[i].fillTransparent) ? "transparent" : this.paths[i].fillColor))
                        p.parentElement.appendChild(tmp)
                        p.parentElement.removeChild(p)
                    }
                }
                else{
                    let p = this.svg_source.createElement("path")
                    p.id = Math.floor(Date.now() / 1000) + this.paths[i].id
                    p.setAttribute("d", paths_dataset[i])
                    p.setAttribute("stroke", ((this.paths[i].borderTransparent) ? "transparent" : this.paths[i].strokeColor))
                    p.setAttribute("fill", ((this.paths[i].fillTransparent) ? "transparent" : this.paths[i].fillColor))
                    svg_tag.appendChild(p)
                }

            }
            return serializer.serializeToString(this.svg_source).replaceAll("xmlns=\"\"", '')
        }

    }
}