from db_engine import engine
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from models import User, Message
from seed import seed_user_if_needed
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import random

seed_user_if_needed()

app = FastAPI()

chatbot_responses = [
    "Hello, how can I assist you today?",
    "Is there anything else you need help with?",
    "I'm here to help you.",
]

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    async with AsyncSession(engine) as session:
        async with session.begin():
            # Hardcode the userid that we are interested in for now.
            user_query = await session.execute(select(User).filter(User.id == 1))
            user = user_query.scalars().first()

            if not user:
                websocket.close()
                return

        try:
            while True:
                # Receive message from user
                user_message = await websocket.receive_text()

                # Persist user message to the database
                new_message = Message(sender="user", content=user_message, user_id=user.id)
                session.add(new_message)
                await session.commit()

                # Bot response
                bot_response = f"Bot: {random.choice(chatbot_responses)}"
                bot_message = Message(sender="bot", content=bot_response, user_id=user.id)
                session.add(bot_message)
                await session.commit()

                # Send chatbot's response back to the user
                await websocket.send_text(bot_response)
        except WebSocketDisconnect:
            print(f"User disconnected.")