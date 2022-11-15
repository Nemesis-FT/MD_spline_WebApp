class Path{
    constructor(id) {
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
    }

    getParamd(){
        return this.paramd;
    }
}