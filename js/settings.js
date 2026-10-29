const Settings = {
    initialized: false,
    defaults: {
        uiScale: 110, textSize: "normal", density: "cozy", crt: true, crtStrength: 18,
        reactive: true, boot: true, bootStyle: "cute", visualizer: "bars", visualizerIntensity: 100,
        visualizerColor: "theme", bassIntensity: "normal", screenShake: true, petActivity: "normal",
        petReactions: true, uiSounds: false, windowMode: "normal",
        advancedAlbumSize: 100, advancedVizHeight: 100, advancedPetSize: 100,
        advancedControlSize: 100, advancedGap: 100, advancedBorder: 3, advancedShowAlbum: true, advancedShowPet: true, advancedStatusbar: true
    },

    initialize() {
        if (this.initialized) return;
        this.initialized = true;
        const $ = id => document.querySelector(`#${id}`);
        const load = (key, fallback=this.defaults[key]) => KritrStorage.load(key, fallback);
        const clamp = (value,min,max) => Math.min(max,Math.max(min,Number(value)||min));
        const set = (id,value) => { const el=$(id); if(!el)return; if(el.type==="checkbox")el.checked=Boolean(value); else el.value=value; };
        const output = (id,value,suffix="%") => { const el=document.querySelector(`[data-for="${id}"]`); if(el) el.value=`${value}${suffix}`; };

        const s = {
            uiScale: clamp(load("uiScale"),90,140), textSize: load("textSize"), density: load("density"),
            crt: Boolean(load("crt")), crtStrength: clamp(load("crtStrength"),0,100), reactive: Boolean(load("reactive")),
            boot: Boolean(load("boot")), bootStyle: load("bootStyle"), visualizer: load("visualizer"),
            visualizerIntensity: clamp(load("visualizerIntensity"),50,150), visualizerColor: load("visualizerColor"),
            bassIntensity: load("bassIntensity"), screenShake: Boolean(load("screenShake")), petActivity: load("petActivity"),
            petReactions: Boolean(load("petReactions")), uiSounds: Boolean(load("uiSounds")), windowMode: load("windowMode"),
            advancedAlbumSize: clamp(load("advancedAlbumSize"),70,150), advancedVizHeight: clamp(load("advancedVizHeight"),70,160),
            advancedPetSize: clamp(load("advancedPetSize"),70,160), advancedControlSize: clamp(load("advancedControlSize"),80,140),
            advancedGap: clamp(load("advancedGap"),60,160), advancedBorder: clamp(load("advancedBorder"),1,5),
            advancedShowAlbum: Boolean(load("advancedShowAlbum")), advancedShowPet: Boolean(load("advancedShowPet")),
            advancedStatusbar: Boolean(load("advancedStatusbar"))
        };

        Object.entries({
            "ui-scale":s.uiScale,"text-size":s.textSize,"ui-density":s.density,"crt-toggle":s.crt,"crt-strength":s.crtStrength,
            "reactive-toggle":s.reactive,"boot-toggle":s.boot,"boot-style":s.bootStyle,"visualizer-select":s.visualizer,
            "visualizer-intensity":s.visualizerIntensity,"visualizer-color":s.visualizerColor,"bass-intensity":s.bassIntensity,
            "screen-shake":s.screenShake,"pet-activity":s.petActivity,"pet-reactions":s.petReactions,"ui-sounds":s.uiSounds,
            "window-mode":s.windowMode,"advanced-album-size":s.advancedAlbumSize,"advanced-viz-height":s.advancedVizHeight,
            "advanced-pet-size":s.advancedPetSize,"advanced-control-size":s.advancedControlSize,"advanced-gap":s.advancedGap,
            "advanced-border":s.advancedBorder,"advanced-show-album":s.advancedShowAlbum,"advanced-show-pet":s.advancedShowPet,"advanced-statusbar":s.advancedStatusbar
        }).forEach(([id,v])=>set(id,v));

        this.applyScale(s.uiScale); this.applyTextSize(s.textSize); this.applyDensity(s.density); this.applyCRT(s.crt,s.crtStrength);
        this.applyReactive(s.reactive); this.applyVisualizerIntensity(s.visualizerIntensity); Visualizer.setMode(s.visualizer);
        this.applyVisualizerColor(s.visualizerColor); this.applyBass(s.bassIntensity,s.screenShake); Pet.setActivity(s.petActivity);
        Pet.setReactions(s.petReactions); Features.uiSounds=s.uiSounds; Features.applyWindowMode(s.windowMode);
        document.body.dataset.bootStyle=s.bootStyle; this.applyAdvanced(s);

        [["ui-scale",s.uiScale],["visualizer-intensity",s.visualizerIntensity],["crt-strength",s.crtStrength],
         ["advanced-album-size",s.advancedAlbumSize],["advanced-viz-height",s.advancedVizHeight],["advanced-pet-size",s.advancedPetSize],
         ["advanced-control-size",s.advancedControlSize],["advanced-gap",s.advancedGap]].forEach(([id,v])=>output(id,v));
        output("advanced-border",s.advancedBorder,"px");

        $("theme-select")?.addEventListener("change",e=>KritrThemes.set(e.target.value));
        KritrThemes.syncInputs();
        const customIds=["custom-bg","custom-window","custom-accent","custom-accent2","custom-text","custom-outline"];
        customIds.forEach(id=>$(id)?.addEventListener("input",()=>this.applyCustomThemeFromControls(true)));
        $("apply-custom-theme")?.addEventListener("click",()=>this.applyCustomThemeFromControls(true));
        this.bindRange("ui-scale","uiScale",v=>this.applyScale(v),90,140,output);
        $("text-size")?.addEventListener("change",e=>{this.applyTextSize(e.target.value);KritrStorage.save("textSize",e.target.value);});
        $("ui-density")?.addEventListener("change",e=>{this.applyDensity(e.target.value);KritrStorage.save("density",e.target.value);});
        $("visualizer-select")?.addEventListener("change",e=>{VisualiserSafe(e.target.value);});
        function VisualiserSafe(v){ Visualizer.setMode(v); KritrStorage.save("visualizer",Visualizer.mode); }
        this.bindRange("visualizer-intensity","visualizerIntensity",v=>this.applyVisualizerIntensity(v),50,150,output);
        $("visualizer-color")?.addEventListener("change",e=>{this.applyVisualizerColor(e.target.value);KritrStorage.save("visualizerColor",e.target.value);});
        $("crt-toggle")?.addEventListener("change",e=>{this.applyCRT(e.target.checked,Number($("crt-strength")?.value||18));KritrStorage.save("crt",e.target.checked);});
        this.bindRange("crt-strength","crtStrength",v=>this.applyCRT($("crt-toggle")?.checked??true,v),0,100,output);
        $("reactive-toggle")?.addEventListener("change",e=>{this.applyReactive(e.target.checked);KritrStorage.save("reactive",e.target.checked);});
        $("bass-intensity")?.addEventListener("change",e=>{this.applyBass(e.target.value,$("screen-shake")?.checked);KritrStorage.save("bassIntensity",e.target.value);});
        $("screen-shake")?.addEventListener("change",e=>{this.applyBass($("bass-intensity")?.value||"normal",e.target.checked);KritrStorage.save("screenShake",e.target.checked);});
        $("pet-activity")?.addEventListener("change",e=>Pet.setActivity(e.target.value));
        $("pet-reactions")?.addEventListener("change",e=>Pet.setReactions(e.target.checked));
        $("boot-toggle")?.addEventListener("change",e=>KritrStorage.save("boot",e.target.checked));
        $("boot-style")?.addEventListener("change",e=>{document.body.dataset.bootStyle=e.target.value;KritrStorage.save("bootStyle",e.target.value);});
        $("window-mode")?.addEventListener("change",e=>Features.applyWindowMode(e.target.value));
        $("ui-sounds")?.addEventListener("change",e=>{Features.uiSounds=e.target.checked;KritrStorage.save("uiSounds",e.target.checked);Features.playUISound("confirm");});

        $("advanced-toggle")?.addEventListener("click",()=>{ const panel=$("advanced-settings"); if(!panel)return; panel.hidden=!panel.hidden; $("advanced-toggle").setAttribute("aria-expanded",String(!panel.hidden)); $("advanced-toggle").textContent=panel.hidden?"OPEN ADVANCED SETTINGS":"CLOSE ADVANCED SETTINGS"; });
        const advanced=[
            ["advanced-album-size","advancedAlbumSize",70,150],["advanced-viz-height","advancedVizHeight",70,160],
            ["advanced-pet-size","advancedPetSize",70,160],["advanced-control-size","advancedControlSize",80,140],
            ["advanced-gap","advancedGap",60,160],["advanced-border","advancedBorder",1,5]
        ];
        advanced.forEach(([id,key,min,max])=>this.bindRange(id,key,()=>this.applyAdvancedFromControls(),min,max,(id,v)=>output(id,v,id==="advanced-border"?"px":"%")));
        $("advanced-show-album")?.addEventListener("change",e=>{KritrStorage.save("advancedShowAlbum",e.target.checked);this.applyAdvancedFromControls();});
        $("advanced-show-pet")?.addEventListener("change",e=>{KritrStorage.save("advancedShowPet",e.target.checked);this.applyAdvancedFromControls();});
        $("advanced-statusbar")?.addEventListener("change",e=>{KritrStorage.save("advancedStatusbar",e.target.checked);this.applyAdvancedFromControls();});
        $("reset-advanced")?.addEventListener("click",()=>this.resetAdvanced());
        $("shortcuts-btn")?.addEventListener("click",()=>{const help=$("shortcut-help");if(help)help.hidden=!help.hidden;});
        $("reset-settings")?.addEventListener("click",()=>{if(!confirm("Reset Kritr settings? Your saved music library will stay intact."))return; Object.keys(this.defaults).forEach(k=>localStorage.removeItem(`kritr_${k}`)); location.reload();});
    },

    bindRange(id,key,apply,min,max,outputFn){ const el=document.querySelector(`#${id}`); el?.addEventListener("input",e=>{const v=Math.min(max,Math.max(min,Number(e.target.value)));apply(v);KritrStorage.save(key,v);outputFn?.(id,v);}); },
    applyScale(v){document.documentElement.style.setProperty("--ui-scale",Math.max(.9,Math.min(1.4,v/100)));},
    applyTextSize(v){const m={small:1.02,normal:1.14,large:1.28,xlarge:1.42};document.documentElement.style.setProperty("--font-scale",m[v]||m.normal);document.body.dataset.textSize=v;},
    applyDensity(v){document.body.dataset.density=v;},
    applyCRT(on,strength){document.documentElement.style.setProperty("--crt-opacity",Math.max(0,Math.min(1,strength/100)));const o=document.querySelector("#crt-overlay");if(o)o.style.display=on?"block":"none";},
    applyReactive(on){document.querySelector(".kritr-window")?.classList.toggle("reactive-on",on);if(!on){document.documentElement.style.setProperty("--energy","0");document.documentElement.style.setProperty("--bass","0");}},
    applyVisualizerIntensity(v){document.documentElement.style.setProperty("--viz-intensity",v/100);},
    applyVisualizerColor(v){Visualizer.colorMode=v;document.body.dataset.vizColor=v;},
    applyBass(level,shake){document.body.dataset.bassFx=level;document.body.dataset.screenShake=shake?"on":"off";},

    applyAdvanced(s){
        const r=document.documentElement.style;
        r.setProperty("--adv-album-scale",s.advancedAlbumSize/100); r.setProperty("--adv-viz-scale",s.advancedVizHeight/100);
        r.setProperty("--adv-pet-scale",s.advancedPetSize/100); r.setProperty("--adv-control-scale",s.advancedControlSize/100);
        r.setProperty("--adv-gap-scale",s.advancedGap/100); r.setProperty("--adv-border",`${s.advancedBorder}px`);
        document.body.dataset.albumArt=s.advancedShowAlbum?"on":"off";
        document.body.dataset.pet=s.advancedShowPet?"on":"off";
        document.body.dataset.statusbar=s.advancedStatusbar?"on":"off";
    },
    applyAdvancedFromControls(){
        const $=id=>document.querySelector(`#${id}`); const s={
            advancedAlbumSize:Number($("advanced-album-size")?.value||100),advancedVizHeight:Number($("advanced-viz-height")?.value||100),
            advancedPetSize:Number($("advanced-pet-size")?.value||100),advancedControlSize:Number($("advanced-control-size")?.value||100),
            advancedGap:Number($("advanced-gap")?.value||100),advancedBorder:Number($("advanced-border")?.value||3),
            advancedShowAlbum:$("advanced-show-album")?.checked??true,advancedShowPet:$("advanced-show-pet")?.checked??true,
            advancedStatusbar:$("advanced-statusbar")?.checked??true
        }; this.applyAdvanced(s);
    },

    applyCustomThemeFromControls(selectCustom=true){
        const $=id=>document.querySelector(`#${id}`);
        const v={bg:$("custom-bg")?.value||"#101112",window:$("custom-window")?.value||"#1b1d1e",accent:$("custom-accent")?.value||"#f3f0e9",accent2:$("custom-accent2")?.value||"#9ea6a8",text:$("custom-text")?.value||"#f3f0e9",outline:$("custom-outline")?.value||"#050505"};
        KritrThemes.saveCustom(v);
        if(selectCustom) KritrThemes.set("custom");
    },
    resetAdvanced(){
        const values={"advanced-album-size":100,"advanced-viz-height":100,"advanced-pet-size":100,"advanced-control-size":100,"advanced-gap":100,"advanced-border":3};
        Object.entries(values).forEach(([id,v])=>{const el=document.querySelector(`#${id}`);if(el)el.value=v;KritrStorage.save({"advanced-album-size":"advancedAlbumSize","advanced-viz-height":"advancedVizHeight","advanced-pet-size":"advancedPetSize","advanced-control-size":"advancedControlSize","advanced-gap":"advancedGap","advanced-border":"advancedBorder"}[id],v);const o=document.querySelector(`[data-for="${id}"]`);if(o)o.value=`${v}${id==="advanced-border"?"px":"%"}`;});
        const album=document.querySelector("#advanced-show-album");if(album)album.checked=true;KritrStorage.save("advancedShowAlbum",true);
        const pet=document.querySelector("#advanced-show-pet");if(pet)pet.checked=true;KritrStorage.save("advancedShowPet",true);
        const status=document.querySelector("#advanced-statusbar");if(status)status.checked=true;KritrStorage.save("advancedStatusbar",true);this.applyAdvancedFromControls();Pet?.say?.("layout reset!",1000);
    }
};
