# aplicado
Arrancando una aplicación nuevamente desde cero

# la idea es aprender
Pensando en cómo es hacer un sistema realmente desde cero creemos que lo mejor es probar.
Probar y dejar registrado lo que probamos. 

## ¿qué vamos a construir?
Un pequeño portal de noticias (parecido a https://github.com/codenautas/puntapie-inicial). 

El público en general ve breves noticias publicadas en el portal sin necesidad de registrarse. 
El Sistema tiene dos tipos de usuarios, los redactores (los que escriben las noticias)
y los editores (responsables que deciden la publicación, edición retiro de noticias 
y la administración de los redactores). 

Lo importante es que las noticas están vinculadas a sus fuentes. 

# El camino

No tenemos un usuario real, así que no podemos hacer Scrum. Pero podemos simularlo. 

La idea es dar siempre pasos cortos, decidir qué vamos a hacer, 
[escribirlo](https://github.com/codenautas/aplicado/blob/master/docs/pasos/haciendo.md), 
hacer commit, luego hacerlo.

## Si hay *refactor* que se note

Empezamos con dos comits por avance, uno con el plan otro con la realización. 
Idealmente deberían ser más:
   1. descripción del plan o idea a realizar o error a corregir
   2. escribir los casos de prueba de lo que se quiere agregar o arreglar
   3. mejorar el código (refactor) antes de realizar lo planeado
   4. agregregar código para realizar lo planeado 
      (puede incluir más mejoras, ajustes a los casos de prueba o al plan original)
   5. conclusiones (limitaciones, problemas, lecciones aprendidas y/o ideas para continuar)

## Si hay metodología que se use

Vamos a usar las metodologías más conocidas:
  * [KISS](https://web.archive.org/web/20110921083918/http://people.apache.org/~fhanik/kiss.html) 
    Mantenerlo sencillo, parece fácil pero no lo es.
  * [SOLID](http://butunclebob.com/ArticleS.UncleBob.PrinciplesOfOod) 
    Para no romper la compatibilidad con el futuro. 
    No tenemos que olvidarnos en **tener presente cómo se podrían extender las clases**. 
    Lo de depender de las interfaces suena interesante, hay que probarlo. 

Y vamos a escribir nuestras propias reglas 
(ya sean reglas nuevas o reinterpretación de las reglas que tienen las metodologías que usamos):
   * [conocimiento unilateral](https://github.com/codenautas/codenautas/blob/master/docs/conocimiento-unidireccional.md#conocimiento-unidireccional): 
     Si A conoce a B, B no puede conocer a A.

# ¿Qué esperamos?

   * Adquirir experiencia, aprender en el camino.
   * Ver emerger un framework
