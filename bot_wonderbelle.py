import telebot
import json
import os

# 🔑 TUS DATOS
TOKEN_BOT = "PON_TU_TOKEN_AQUÍ"
TOKEN_PAGO = "PON_TU_TOKEN_DE_PAGO_AQUÍ"

ARCHIVO_DATOS = "jugadores.json"

def cargar_datos():
    if os.path.exists(ARCHIVO_DATOS):
        with open(ARCHIVO_DATOS, "r") as f:
            return json.load(f)
    return {}

def guardar_datos(datos):
    with open(ARCHIVO_DATOS, "w") as f:
        json.dump(datos, f)

bot = telebot.TeleBot(TOKEN_BOT)

# 📥 Recibe la compra desde la tienda
@bot.message_handler(content_types=['web_app_data'])
def desde_tienda(mensaje):
    datos = json.loads(mensaje.web_app_data.data)
    if datos['accion'] == 'comprar':
        bot.send_invoice(
            chat_id=mensaje.chat.id,
            title=f"Compra: {datos['producto']}",
            description="Gracias por apoyar CosmicBTetris 🚀",
            invoice_payload=datos['producto'],
            provider_token=TOKEN_PAGO,
            currency='EUR',
            prices=[{'label': datos['producto'], 'amount': int(round(float(datos['monto'])*100))}]
        )

@bot.pre_checkout_query_handler(func=lambda q: True)
def antes_de_pagar(query):
    bot.answer_pre_checkout_query(query.id, ok=True)

# ✅ AQUÍ VA TU CÓDIGO — justo dentro de esta función
@bot.message_handler(content_types=['successful_payment'])
def pago_confirmado(mensaje):
    producto = mensaje.successful_payment.invoice_payload
    usuario_id = mensaje.from_user.id
    
    # 👇 TU CÓDIGO PEGADO AQUÍ 👇
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
    # 👆 FIN de tu código 👆

    bot.send_message(
        mensaje.chat.id,
        f"✅ ¡Listo! 🎉\n\n{producto} activado\n¡Disfruta! 🌌"
    )

print("🤖 Bot funcionando...")
bot.infinity_polling()
