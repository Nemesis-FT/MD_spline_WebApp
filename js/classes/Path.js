/**
 * The path class is used to store and generate elements that are related to a single path.
 */
class Path{
    constructor(id, svgSource = null, numberPoints) {
        this.paramd = {
            degree: [],
            continuity: [],
            ampiezzaSegmenti: [1],
            estremoA: 0,
            estremoB: 0,
            breakPoint: [],
            indicePrimoBreakPoint: 0,
            indiceUltimoBreakPoint: 0,
            partizioneNodaleT: [],
            partizioneNodaleS: [],
            indiciPartizioneNodaleT: [],
            indiciPartizioneNodaleS: []
        }
        this.controlPoint = [];
        this.pointShape = [];
        this.IDpointCurve = -1;
        this.IDelement = -1;
        this.IDlinePoint = -1;
        this.id = id
        this.fl = []
        this.bs = []
        this.svgSource = svgSource
        this.fillColor = "#000000"
        this.strokeColor = "#000000"
        this.fillTransparent = false
        this.borderTransparent = false
        this.numberPoints = numberPoints
        if(!svgSource){
            return
        }
        if(svgSource.getAttribute("stroke") && svgSource.getAttribute("stroke")!=="null" && svgSource.getAttribute("stroke")!=="none" && svgSource.getAttribute("stroke")!=="transparent"){
            this.r_strokeColor = colorConverter(svgSource.getAttribute("stroke"))
        }
        else{
            this.r_strokeColor = "#000000"
            this.borderTransparent = true
        }
        if(svgSource.getAttribute("fill") && svgSource.getAttribute("fill")!=="null" && svgSource.getAttribute("fill")!=="none" && svgSource.getAttribute("fill")!=="transparent") {
            this.r_fillColor = colorConverter(svgSource.getAttribute("fill"))
            this.fillTransparent = false
        }
        else{
            this.r_fillColor = "#000000"
            if(!svgSource.getAttribute("fill") || svgSource.getAttribute("fill")==="transparent" || svgSource.getAttribute("fill")==="none"){
                this.fillTransparent = true
            }
            if(!svgSource.getAttribute("fill")){
                this.borderTransparent = false
            }
        }
        this.fillColor = this.r_fillColor
        this.strokeColor = this.r_strokeColor

    }

    getParamd(){
        return this.paramd;
    }

    getBlankParamd(){
        return {
            degree: [],
            continuity: [],
            ampiezzaSegmenti: [1],
            estremoA: 0,
            estremoB: 0,
            breakPoint: [],
            indicePrimoBreakPoint: 0,
            indiceUltimoBreakPoint: 0,
            partizioneNodaleT: [],
            partizioneNodaleS: [],
            indiciPartizioneNodaleT: [],
            indiciPartizioneNodaleS: []
        }
    }

    /**
     * This section is responsable for creating the entry in the pathlist on the right sidebar
     * @param container
     */
    createHTML(container){
        let element = document.createElement("li")
        element.className="list-group-item";
        element.id = "path_"+(this.id).toString();
        container.append(element)
        let div = document.createElement("div")
        let paragraph = document.createElement("p")
        paragraph.textContent="Path "+(this.id).toString()
        element.append(paragraph)
        let button = document.createElement("button")
        button.className="btn btn-success";
        button.setAttribute("onclick", "selectPath("+(this.id).toString()+",false, false)")
        button.innerText = "Select";
        element.append(button)
        let button2 = document.createElement("button")
        button2.className="btn btn-info";
        button2.setAttribute("onclick", "movePathUp("+(this.id).toString()+")")
        button2.innerText = "Move down";
        element.append(button2)
        let button3 = document.createElement("button")
        button3.className="btn btn-info";
        button3.setAttribute("onclick", "movePathDown("+(this.id).toString()+")")
        button3.innerText = "Move up";
        element.append(button3)
        let button4 = document.createElement("button")
        button4.className="btn btn-danger";
        button4.setAttribute("onclick", "removePathById("+(this.id).toString()+")")
        button4.innerText = "Delete";
        element.append(button4)
    }
}