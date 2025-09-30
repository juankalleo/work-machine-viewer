#!/bin/bash

echo "📊 Visualizando Dados do Banco"
echo "=============================="
echo ""

# Verificar se o banco existe
if ! psql -h localhost -U postgres -d work_machine_viewer -c "SELECT 1;" >/dev/null 2>&1; then
    echo "❌ Banco work_machine_viewer não existe ou não está acessível"
    echo "   Execute primeiro: npm run db:setup"
    exit 1
fi

echo "👥 USUÁRIOS:"
echo "============"
psql -h localhost -U postgres -d work_machine_viewer -c "SELECT id, username, email, role, created_at FROM users;"

echo ""
echo "💻 EQUIPAMENTOS:"
echo "================"
psql -h localhost -U postgres -d work_machine_viewer -c "SELECT id, nomenclatura, departamento, e_estado, responsavel FROM cpus;"

echo ""
echo "📈 ESTATÍSTICAS:"
echo "================"
psql -h localhost -U postgres -d work_machine_viewer -c "SELECT 'Total de usuários' as tipo, COUNT(*) as quantidade FROM users UNION ALL SELECT 'Total de equipamentos', COUNT(*) FROM cpus;"

echo ""
echo "🏢 EQUIPAMENTOS POR DEPARTAMENTO:"
echo "================================="
psql -h localhost -U postgres -d work_machine_viewer -c "SELECT departamento, COUNT(*) as quantidade FROM cpus GROUP BY departamento ORDER BY quantidade DESC;"

echo ""
echo "⚡ EQUIPAMENTOS POR ESTADO:"
echo "=========================="
psql -h localhost -U postgres -d work_machine_viewer -c "SELECT e_estado, COUNT(*) as quantidade FROM cpus GROUP BY e_estado ORDER BY quantidade DESC;"
