import { useState, useEffect } from 'react'

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')

  // Estados para controlar qual tarefa está sendo editada e seus novos valores
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDueDate, setEditDueDate] = useState('')

  const API_URL = 'http://localhost:8080/tasks'

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    const response = await fetch(API_URL)
    const data = await response.json()
    setTasks(data || [])
  }

  const createTask = async (e) => {
    e.preventDefault()
    if (!title) return alert('O título é obrigatório!')

    const newTask = { title, description, status: 'TODO', dueDate }

    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    })

    setTitle('')
    setDescription('')
    setDueDate('')
    fetchTasks()
    
    // Feedback visual (Requisito da Banca)
  
  }

  const updateStatus = async (id, newStatus) => {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    fetchTasks()
  }

  // Funções novas para lidar com a Edição
  const startEditing = (task) => {
    setEditingTaskId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description)
    setEditDueDate(task.dueDate || '')
  }

  const saveEdit = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: editTitle, 
        description: editDescription, 
        dueDate: editDueDate 
      })
    })
    setEditingTaskId(null)
    fetchTasks()
    alert('✏️ Tarefa atualizada com sucesso!') // Feedback visual
  }

  const deleteTask = async (id) => {
    if(window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })
      fetchTasks()
      alert('🗑️ Tarefa excluída!') // Feedback visual
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const parts = dateString.split('-')
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  const renderColumn = (statusName, titleColumn, bgColor) => {
    const filteredTasks = tasks.filter(task => task.status === statusName)

    return (
      <div className={`flex flex-col w-1/3 p-4 rounded-lg min-h-[500px] ${bgColor}`}>
        <h2 className="text-xl font-bold mb-4 text-gray-700">{titleColumn} ({filteredTasks.length})</h2>
        
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-md shadow-md mb-3 border-l-4 border-blue-500">
            
            {/* Verifica se a tarefa atual é a que está em modo de edição */}
            {editingTaskId === task.id ? (
              <div className="flex flex-col gap-2">
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="border p-1 text-sm rounded" placeholder="Título" />
                <input type="text" value={editDescription} onChange={e => setEditDescription(e.target.value)} className="border p-1 text-sm rounded" placeholder="Descrição" />
                <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} className="border p-1 text-sm rounded" />
                
                <div className="flex gap-2 mt-2">
                  <button onClick={() => saveEdit(task.id)} className="bg-green-500 text-white px-2 py-1 rounded text-xs w-full">Salvar</button>
                  <button onClick={() => setEditingTaskId(null)} className="bg-gray-400 text-white px-2 py-1 rounded text-xs w-full">Cancelar</button>
                </div>
              </div>
            ) : (
              // Visualização Normal do Cartão
              <>
                <h3 className="font-bold text-lg">{task.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                {task.dueDate && (
                  <p className="text-xs font-bold text-red-500 mb-4">
                    Prazo: {formatDate(task.dueDate)}
                  </p>
                )}
                
                <div className="flex justify-between gap-1 text-xs mb-2">
                   <button onClick={() => startEditing(task)} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 w-full">Editar</button>
                   <button onClick={() => deleteTask(task.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 w-full">Excluir</button>
                </div>

                <div className="flex justify-between gap-1 text-xs">
                  {statusName !== 'TODO' && (
                    <button onClick={() => updateStatus(task.id, statusName === 'DONE' ? 'DOING' : 'TODO')} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 w-full">
                      Voltar
                    </button>
                  )}
                  {statusName !== 'DONE' && (
                    <button onClick={() => updateStatus(task.id, statusName === 'TODO' ? 'DOING' : 'DONE')} className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 w-full">
                      Avançar
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Mini Kanban - Fullstack</h1>

      <form onSubmit={createTask} className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md mb-8 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Título</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Ex: Estudar Go" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Detalhes da tarefa..." />
        </div>
        
        <div className="w-40">
          <label className="block text-sm font-medium text-gray-700">Prazo</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-bold">
          + Adicionar
        </button>
      </form>

      <div className="flex gap-6 max-w-6xl mx-auto">
        {/* Nomes das colunas alterados conforme o edital */}
        {renderColumn('TODO', 'A Fazer', 'bg-gray-200')}
        {renderColumn('DOING', 'Em Progresso', 'bg-blue-100')}
        {renderColumn('DONE', 'Concluídas', 'bg-green-100')}
      </div>
    </div>
  )
}

export default App