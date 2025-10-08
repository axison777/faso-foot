import { AfterViewInit, Component, DestroyRef, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-kit-viewer',
  standalone: true,
  templateUrl: './kit-viewer.component.html',
  styleUrls: ['./kit-viewer.component.scss']
})
export class KitViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Couleurs hex: ex. #FF0000
  @Input() shirtColor: string | undefined | null = null;
  @Input() shortColor: string | undefined | null = null;
  @Input() socksColor: string | undefined | null = null;

  // Taille du rendu (pixels)
  @Input() width = 180;
  @Input() height = 220;

  // Rotation automatique
  @Input() autoRotate = true;
  @Input() autoRotateSpeed = 0.005; // radians/frame

  private renderer!: any;
  private scene!: any;
  private camera!: any;
  private kitRoot: any | null = null;
  private animationFrameId: number | null = null;

  // Map des matériaux par nom (du GLB)
  private materialByName = new Map<string, any>();

  constructor(private host: ElementRef, private destroyRef: DestroyRef) {}

  ngAfterViewInit(): void {
    this.initThree();
    this.loadModel();
    this.startRenderLoop();
    window.addEventListener('resize', this.onWindowResize);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.materialByName.size > 0) {
      this.applyColors();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize);
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    this.dispose();
  }

  private initThree(): void {
    this.scene = new THREE.Scene();
    // Fond transparent
    // @ts-ignore - keep transparent background
    this.scene.background = null;

    this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 1.4, 3.2);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.nativeElement, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    // Transparence totale
    // @ts-ignore
    this.renderer.setClearColor(0x000000, 0);
    // @ts-ignore
    this.renderer.outputColorSpace = (THREE as any).SRGBColorSpace ?? (THREE as any).sRGBEncoding;

    // Eclairages: hémisphérique + directionnels doux
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    hemi.position.set(0, 2, 0);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(2, 4, 3);
    this.scene.add(dir);

    const dir2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dir2.position.set(-2, 3, -3);
    this.scene.add(dir2);

    // Pas de sol pour garder le fond transparent
  }

  private loadModel(): void {
    const loader = new GLTFLoader();
    loader.load(
      'assets/model/Kit_football.glb',
      (gltf: any) => {
        this.kitRoot = gltf.scene;
        // Normaliser l'échelle si nécessaire
        this.kitRoot.scale.set(1.2, 1.2, 1.2);

        // Récupérer tous les matériaux par nom
        this.materialByName.clear();
        this.kitRoot.traverse((obj: any) => {
          const mesh = obj as any;
          const mat = (mesh as any).material as any;
          if (!mat) return;
          if (Array.isArray(mat)) {
            mat.forEach((m: any) => {
              if ((m as any).name) this.materialByName.set((m as any).name, m);
            });
          } else {
            if ((mat as any).name) this.materialByName.set((mat as any).name, mat);
          }
        });

        // Appliquer couleurs initiales
        this.applyColors();

        // Centrer et cadrer le modèle pour occuper toute la hauteur
        this.centerAndFrame(this.kitRoot);

        this.scene.add(this.kitRoot);
      },
      undefined,
      (err: any) => {
        console.error('Erreur chargement GLB Kit_football.glb', err);
      }
    );
  }

  private applyColors(): void {
    // Noms de matériaux attendus
    this.setMaterialColorByName('M_Couleur_Shirt', this.shirtColor);
    this.setMaterialColorByName('M_Couleur_Short', this.shortColor);
    this.setMaterialColorByName('M_Couleur_Socks', this.socksColor);
  }

  private setMaterialColorByName(name: string, hex: string | null | undefined): void {
    if (!hex) return;
    const mat = this.materialByName.get(name);
    if (!mat) return;
    const anyMat = mat as any;

    const parsed = this.parseHexWithAlpha(hex);
    if (anyMat.color && typeof anyMat.color.setHex === 'function') {
      anyMat.color.setHex(parsed.rgb);
      if (parsed.alpha < 1) {
        anyMat.transparent = true;
        anyMat.opacity = parsed.alpha;
      }
      // Si pas de textures, assure un rendu tissu agréable
      if (typeof anyMat.roughness === 'number') {
        anyMat.roughness = Math.min(1, Math.max(0.5, anyMat.roughness ?? 0.8));
      }
      if (typeof anyMat.metalness === 'number') {
        anyMat.metalness = 0.0;
      }
      anyMat.needsUpdate = true;
    }
  }

  // Supporte #RRGGBB et #RRGGBBAA
  private parseHexWithAlpha(hex: string): { rgb: number; alpha: number } {
    const h = (hex || '').trim();
    if (!h) return { rgb: 0xffffff, alpha: 1 };
    const raw = h.startsWith('#') ? h.slice(1) : h;
    if (raw.length === 8) {
      const r = parseInt(raw.slice(0, 2), 16);
      const g = parseInt(raw.slice(2, 4), 16);
      const b = parseInt(raw.slice(4, 6), 16);
      const a = parseInt(raw.slice(6, 8), 16) / 255;
      return { rgb: (r << 16) + (g << 8) + b, alpha: a };
    }
    if (raw.length === 6) {
      const rgb = parseInt(raw, 16);
      return { rgb, alpha: 1 };
    }
    // Formats courts non supportés -> fallback
    return { rgb: 0xffffff, alpha: 1 };
  }

  private startRenderLoop(): void {
    const render = () => {
      if (this.autoRotate && this.kitRoot) {
        this.kitRoot.rotation.y += this.autoRotateSpeed;
      }
      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  private centerAndFrame(root: any): void {
    const Box3 = (THREE as any).Box3;
    const Vector3 = (THREE as any).Vector3;
    if (!Box3 || !Vector3) return;

    const box = new Box3().setFromObject(root);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Recentrer l'objet à l'origine
    root.position.x += -center.x;
    root.position.y += -center.y;
    root.position.z += -center.z;

    // Calculer la distance caméra pour cadrer la hauteur
    const fov = this.camera.fov * Math.PI / 180;
    const distance = (size.y / 2) / Math.tan(fov / 2);
    const padding = 1.1; // marge pour éviter la coupe

    this.camera.position.set(0, 0, distance * padding);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
  }

  private onWindowResize = () => {
    // Optionnel: si le conteneur change, on pourrait recalculer
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  };

  private dispose(): void {
    if (this.kitRoot) {
      this.kitRoot.traverse((obj: any) => {
        const mesh = obj as any;
        if ((mesh as any).geometry) {
          (mesh as any).geometry.dispose?.();
        }
        const mat = (mesh as any).material as any;
        if (Array.isArray(mat)) {
          mat.forEach((m: any) => this.disposeMaterial(m));
        } else if (mat) {
          this.disposeMaterial(mat);
        }
      });
    }
    this.renderer.dispose();
  }

  private disposeMaterial(mat: any): void {
    const anyMat = mat as any;
    // ne pas toucher aux maps à moins de disposer explicitement
    anyMat.dispose?.();
  }
}
