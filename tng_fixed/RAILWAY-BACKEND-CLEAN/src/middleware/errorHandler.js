export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Rota não encontrada' });
}

export function errorHandler(error, req, res, next) {
  console.error(error);
  res.status(error.status || 500).json({
    error: error.message || 'Erro interno do servidor'
  });
}
