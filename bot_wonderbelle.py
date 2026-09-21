import json
import os

ARCHIVO_DATOS = "jugadores.json"

def cargar_datos():
    if os.path.exists(ARCHIVO_DATOS):
        with open(ARCHIVO_DATOS, "r") as f:
            return json.load(f)
    return {}

def guardar_datos(datos):
    with open(ARCHIVO_DATOS, "w") as f:
        json.dump(datos, f)

# Cuando alguien paga:
datos = cargar_datos()
usuario = str(usuario_id)

if usuario not in datos:
    datos[usuario] = {"gemas": 0, "vip": False}

if producto == "gemas_50":
    datos[usuario]["gemas"] += 50
elif producto == "gemas_150":
    datos[usuario]["gemas"] += 150
elif producto == "vip_500":
    datos[usuario]["gemas"] += 500
    datos[usuario]["vip"] = True

guardar_datos(datos)
