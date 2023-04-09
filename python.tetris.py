import  pygame
import random

#inicializar el juego
pygame.init()

#definir los colores
negro = (0,0,0)
blanco =(255,255,255)
rojo = (255,0,0)
verde = (0,255,0)
azul = (0,0,255)

#define las dimensiones d ela pantalla
ancho_pantalla = 800
alto_pantalla = 600

#definir el tamano de  cada  bloque
tamano_bloque = 20

#definir la velocidad de caida de las piezas
velocidad = 15

#definir  dimensiones  de la cuadricula
ancho_cuadricula = 10
alto_cuadricula = 20

#definir  dimensiones de las piezas
x_pieza = ancho_cuadricula //2
y_pieza = 0

#definir la lista de piezas
piezas=[
    [1,1,1],
    [0,1,0],
    [0,2,2],
    [2,2,0],
    [3,3,0],
    [0,3,3],
    [4,0,0],
    [4,4,4],
    [0,0,5],
    [5,5,5],
    [6,6],
    [6,6],
    [7,7,7,7]
  ]

#define la clase de pieza
class Pieza:
    def __init__ (self):
        self.tipo = random.randin(0, len(piezas)-1)
        self.rotation=0
        self.x=x_pieza
        self.y=y_pieza
        self.color=self.tipo+1

    def get_format(self):
        return  piezas[self.tipo][self.rotation]

    def girar(self):
        self.rotation =(self.rotation +1)%len(piezas[self.tipo])

    def move(self,dx,dy):
        self.x+=dx
        self.y+=dy

#definir la funcion principal del juego
    #crear la pantalla
        pantalla = pygame.display.set_mode(ancho_pantalla, alto_pantalla)
        pygame.displayset_caption("Tetris Clone")

#definir el reloj
        reloj = pygame.time.Clock()

#definir lista de bloques
        bloques=[0]*ancho_cuadricula
        for_in_range(alto_cuadricula)

#definir la bandera de juego temrinado
        terminado=False

#definir la pieza actual
        pieza_actual = Pieza()

#Bucle principal del juego
        while not terminado:
        #manejar eventos
            for event in pygame.event.get():
                if event.type==pygame.QUIT:
                    terminado = True
                elif event.type==pygame.KEY_DOWN:
                    if evento.key==pygame.K_LEFT:
                        pieza_actual.move(-1,0)
                    elif evento.key ==pygame.K_RIGHT:
                            pygame_actual.move(1,0)
                    elif evento.key==pygameK_UP:
                            pieza_actual.girar()
                        #mover la pieza hacia abajo
                    if pygame.time.get_ticks()%(velocidad*10)==0:
                        pieza_actual.move(0,1)
#Comprobar si la pieza  ha bajado hacia el fondo
        forma=pieza_actual_get_format()
        for  fila in range(len(forma)):
            for columna in range(len(forma[0])):
                if forma[fila][columna]!= 0:
                    if pieza_actual.y + fila>= alto_cuadricula or bloques[pieza_actual.y + fila][pieza_actual.x+columna]!= 0:
                        terminado = True
                        break
                    if terminado:
                        break
#Agreg§ar la pieza de la lista de  bloques
        for fila in range(len(forma)):
            for columna in range(len(forma([]))):
                if forma[fila][columna]!= 0:
                    bloques[pieza_actual.y+fila][pieza_actual.x + columna]=pieza_actual.color
                        
#Comprobar si se ha completado una fila
        for fila in range(alto_cuadricula):
            if all(bloques[fila]):
               bloqies.pop(fila)
               bloques.insert(0,[0] * ancho_cuadricula)
                
#dibujar la pantalla
        pantalla.fill(negro)
        for fila in range(alto_cuadricula):
            for columna in range(ancho_cuadricula):
                pygame.draw.rect(plantalla(255,255,255),
               (columna*tamano_bloque.
                fila*tamano_bloque,
                tamano_bloque,tamano_bloque),1)
                if bloques[fila][columna] == 0:
                   pygame.draw.rect(pantalla,(255,255,255),
                   (columna * tamano_bloque,fila * tamano_bloque,
                   tamano_bloque, tamano_bloque))

#dibujar  pieza actual
            for fila in range(len(forma)):
                for columna in range(len(forma)):
                    if forma[fila][columna] == 0:
                        pygame.draw.rect(pantalla,(255,255,255),
                        (pieza_actual.x + columna)*tamano_bloque,
                        (pieza_actual.y+fila)*tamano_bloque,
                        tamano_bloque,tamano_bloque)

#actualizar la pantalla
        pygame.display.flip()
        
#espera el siguiente programa
        reloj.ticl(60)
        
#salir del juego
        pygame.quit()
        
#llamar a la funcion prinxipal del juego
        juego()
                         
                     
                                                            
