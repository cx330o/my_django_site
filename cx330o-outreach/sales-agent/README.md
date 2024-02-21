# cx330o Sales Agent

Context-aware AI sales conversation agent for the cx330o Sales Platform.

## Features

- 8-stage sales conversation model (Introduction → Qualification → Value Proposition → Needs Analysis → Solution Presentation → Objection Handling → Close → End)
- SPIN question framework for needs discovery
- Product knowledge base integration (reduces hallucinations)
- Stripe payment link generation for closing deals
- Calendly meeting scheduling
- Multi-LLM support via LiteLLM (OpenAI, Groq, Claude, etc.)
- Email and SMS outreach capabilities
- Synchronous and streaming conversation modes
- LangSmith tracing for debugging

## Quick Start

```python
from salesgpt.agents import SalesGPT
from langchain_community.chat_models import ChatLiteLLM

llm = ChatLiteLLM(temperature=0.4, model_name="gpt-4-0125-preview")

sales_agent = SalesGPT.from_llm(
    llm,
    use_tools=True,
    verbose=False,
    product_catalog="examples/sample_product_catalog.txt",
    salesperson_name="Sales Rep",
    salesperson_role="Sales Representative",
    company_name="cx330o",
    company_business="Overseas sales automation platform"
)
sales_agent.seed_agent()
sales_agent.step()
```

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
python run.py --verbose True --config examples/example_agent_setup.json
```

## Architecture

Built with LangChain for LLM orchestration. Uses custom agent configuration with tool retrieval for product search, payment processing, and email sending.

## License

MIT — See root LICENSE file.
