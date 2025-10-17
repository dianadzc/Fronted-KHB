import { useState, useEffect } from 'react';
import { FileText, Plus, Download, Eye, Edit, Trash2, UserPlus, Laptop } from 'lucide-react';
import { generateResponsiveFormPDF, previewResponsiveFormPDF } from '../services/responsivePDFGenerator';
import api from '../services/api';

export default function ResponsiveForms() {
    const [forms, setForms] = useState([]);
    const [equipments, setEquipments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showEquipmentModal, setShowEquipmentModal] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('Todas');
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        equipment_type: '',
        brand: '',
        serial_number: '',
        acquisition_cost: '',
        delivery_date: new Date().toISOString().split('T')[0],
        employee_name: '',
        employee_position: '',
        status: 'active'
    });

    const [newEquipment, setNewEquipment] = useState({ name: '' });
    const [newEmployee, setNewEmployee] = useState({
        full_name: '',
        position: '',
        department: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [formsData, equipmentsData, employeesData] = await Promise.all([
                api.getResponsiveForms(),
                api.getEquipments(),
                api.getEmployees()
            ]);
            setForms(formsData);
            setEquipments(equipmentsData);
            setEmployees(employeesData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            alert('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.updateResponsiveForm(editingId, formData);
                alert('Responsiva actualizada exitosamente');
            } else {
                await api.createResponsiveForm(formData);
                alert('Responsiva creada exitosamente');
            }
            setShowModal(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error al procesar la responsiva');
        }
    };

    const handleCreateEquipment = async (e) => {
        e.preventDefault();
        try {
            const result = await api.createEquipment(newEquipment);
            setEquipments([...equipments, result.equipment]);
            setFormData({ ...formData, equipment_type: result.equipment.name });
            setShowEquipmentModal(false);
            setNewEquipment({ name: '' });
            alert('Equipo agregado exitosamente');
        } catch (error) {
            console.error('Error al crear equipo:', error);
            alert(error.message || 'Error al crear el equipo');
        }
    };

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        try {
            const result = await api.createEmployee(newEmployee);
            setEmployees([...employees, result.employee]);
            setFormData({
                ...formData,
                employee_name: result.employee.full_name,
                employee_position: result.employee.position
            });
            setShowEmployeeModal(false);
            setNewEmployee({ full_name: '', position: '', department: '' });
            alert('Empleado agregado exitosamente');
        } catch (error) {
            console.error('Error al crear empleado:', error);
            alert(error.message || 'Error al crear el empleado');
        }
    };

    const handleDownloadPDF = async (id) => {
        try {
            const form = await api.downloadResponsiveFormPDF(id);
            await generateResponsiveFormPDF(form);
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            alert('Error al descargar el PDF');
        }
    };

    const handleViewPDF = async (id) => {
        try {
            const form = await api.downloadResponsiveFormPDF(id);
            await previewResponsiveFormPDF(form);
        } catch (error) {
            console.error('Error al visualizar PDF:', error);
            alert('Error al visualizar el PDF');
        }
    };

    const handleEdit = (form) => {
        setEditingId(form._id || form.id);

        let fechaFormato = new Date().toISOString().split('T')[0];
        if (form.delivery_date) {
            fechaFormato = new Date(form.delivery_date).toISOString().split('T')[0];
        }

        setFormData({
            equipment_type: form.equipment_type,
            brand: form.brand,
            serial_number: form.serial_number,
            acquisition_cost: form.acquisition_cost,
            delivery_date: fechaFormato,
            employee_name: form.employee_name,
            employee_position: form.employee_position,
            status: form.status
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            '¿Estás seguro de que deseas eliminar esta responsiva?\n\nEsta acción no se puede deshacer.'
        );

        if (!confirmDelete) return;

        try {
            await api.deleteResponsiveForm(id);
            alert('Responsiva eliminada exitosamente');
            loadData();
        } catch (error) {
            console.error('Error al eliminar responsiva:', error);
            alert(error.message || 'Error al eliminar la responsiva');
        }
    };

    const handleEmployeeSelect = (e) => {
        const selectedEmployee = employees.find(emp => emp.full_name === e.target.value);
        if (selectedEmployee) {
            setFormData({
                ...formData,
                employee_name: selectedEmployee.full_name,
                employee_position: selectedEmployee.position
            });
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            equipment_type: '',
            brand: '',
            serial_number: '',
            acquisition_cost: '',
            delivery_date: new Date().toISOString().split('T')[0],
            employee_name: '',
            employee_position: '',
            status: 'active'
        });
    };

    const filteredForms = filterStatus === 'Todas'
        ? forms
        : forms.filter(form => form.status === filterStatus.toLowerCase());

    const statusColors = {
        'active': 'bg-green-100 text-green-800',
        'returned': 'bg-blue-100 text-blue-800',
        'damaged': 'bg-red-100 text-red-800'
    };

    const statusLabels = {
        'active': 'Activa',
        'returned': 'Devuelta',
        'damaged': 'Dañada'
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Cargando responsivas...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
                        Formatos Responsivos
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Gestión de responsivas de equipos - Departamento de Sistemas
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg transition-colors w-full sm:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Responsiva
                </button>
            </div>

            {/* Filtros y estadísticas */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {['Todas', 'Active', 'Returned', 'Damaged'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${filterStatus === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status === 'Todas' ? 'Todas' : statusLabels[status.toLowerCase()]}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-6">
                        <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-blue-600">
                                {forms.length}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Total</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-green-600">
                                {forms.filter(f => f.status === 'active').length}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Activas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg sm:text-2xl font-bold text-purple-600 truncate">
                                ${forms
                                    .filter(f => f.status === 'active')
                                    .reduce((sum, f) => sum + parseFloat(f.acquisition_cost || 0), 0)
                                    .toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Valor Total</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de responsivas */}
            <div className="grid gap-3 sm:gap-4">
                {filteredForms.map((form) => (
                    <div key={form._id || form.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className="text-xs sm:text-sm font-medium text-gray-500">
                                        {form.form_code || `RESP-${form._id?.slice(-6)}`}
                                    </span>
                                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${statusColors[form.status]}`}>
                                        {statusLabels[form.status]}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-600">Equipo:</p>
                                        <p className="font-semibold text-sm sm:text-base text-gray-800">{form.equipment_type}</p>
                                        <p className="text-xs text-gray-500">{form.brand} - {form.serial_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-600">Entregado a:</p>
                                        <p className="font-semibold text-sm sm:text-base text-gray-800">{form.employee_name}</p>
                                        <p className="text-xs text-gray-500">{form.employee_position}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-600">Costo de adquisición:</p>
                                        <p className="font-semibold text-blue-600 text-base sm:text-lg">
                                            ${parseFloat(form.acquisition_cost || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-600">Fecha de entrega:</p>
                                        <p className="text-sm text-gray-800">
                                            {new Date(form.delivery_date || form.createdAt).toLocaleDateString('es-MX')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2">
                                <button
                                    onClick={() => handleViewPDF(form._id || form.id)}
                                    className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors text-sm"
                                    title="Ver PDF"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span className="hidden sm:inline">Ver PDF</span>
                                    <span className="sm:hidden">Ver</span>
                                </button>

                                <button
                                    onClick={() => handleDownloadPDF(form._id || form.id)}
                                    className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 transition-colors text-sm"
                                    title="Descargar PDF"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="hidden sm:inline">Descargar</span>
                                    <span className="sm:hidden">Descargar</span>
                                </button>

                                <button
                                    onClick={() => handleEdit(form)}
                                    className="px-3 sm:px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2 transition-colors text-sm"
                                    title="Editar"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span className="hidden sm:inline">Editar</span>
                                    <span className="sm:hidden">Editar</span>
                                </button>

                                <button
                                    onClick={() => handleDelete(form._id || form.id)}
                                    className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 transition-colors text-sm"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Eliminar</span>
                                    <span className="sm:hidden">Eliminar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredForms.length === 0 && (
                    <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-gray-500 bg-white rounded-lg shadow-md">
                        No hay responsivas {filterStatus !== 'Todas' && `con estado "${statusLabels[filterStatus.toLowerCase()]}"`}
                    </div>
                )}
            </div>
            {/* Modal Responsiva */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 sm:mb-6">
                            <img
                                src="http://localhost:5000/public/images/beachscape-logo.png"
                                alt="Beachscape Logo"
                                className="h-12 sm:h-16"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                                    {editingId ? 'EDITAR RESPONSIVA' : 'NUEVA RESPONSIVA'}
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Formato de entrega de equipo - Departamento de Sistemas
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Fecha de entrega */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        FECHA DE ENTREGA *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.delivery_date}
                                        onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                    />
                                </div>

                                {/* Tipo de equipo */}
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            TIPO DE EQUIPO *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowEquipmentModal(true)}
                                            className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm flex items-center gap-1 font-medium"
                                        >
                                            <Laptop className="w-4 h-4" />
                                            Agregar nuevo equipo
                                        </button>
                                    </div>
                                    <select
                                        required
                                        value={formData.equipment_type}
                                        onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                    >
                                        <option value="">Seleccionar equipo...</option>
                                        {equipments.map((equipment) => (
                                            <option key={equipment._id} value={equipment.name}>
                                                {equipment.name}
                                            </option>
                                        ))}
                                    </select>
                                    {equipments.length === 0 && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            No hay equipos registrados. Haz clic en "Agregar nuevo equipo" para crear uno.
                                        </p>
                                    )}
                                </div>

                                {/* Marca y Serie */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            MARCA *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                            placeholder="Ej: DELL INSPIRON15 5510"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            NÚMERO DE SERIE *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.serial_number}
                                            onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                            placeholder="Ej: B3QYSG3"
                                        />
                                    </div>
                                </div>

                                {/* Costo de adquisición */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        COSTO DE ADQUISICIÓN: $ *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.acquisition_cost}
                                        onChange={(e) => setFormData({ ...formData, acquisition_cost: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                        placeholder="0.00"
                                    />
                                </div>

                                {/* Empleado */}
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            ENTREGAR A: *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowEmployeeModal(true)}
                                            className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm flex items-center gap-1 font-medium"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Agregar nuevo empleado
                                        </button>
                                    </div>
                                    <select
                                        required
                                        value={formData.employee_name}
                                        onChange={handleEmployeeSelect}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                    >
                                        <option value="">Seleccionar empleado...</option>
                                        {employees.map((employee) => (
                                            <option key={employee._id} value={employee.full_name}>
                                                {employee.full_name} - {employee.position}
                                            </option>
                                        ))}
                                    </select>
                                    {employees.length === 0 && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            No hay empleados registrados. Haz clic en "Agregar nuevo empleado" para crear uno.
                                        </p>
                                    )}
                                </div>

                                {/* Cargo del empleado (se llena automáticamente) */}
                                {formData.employee_position && (
                                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-2 border-blue-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            CARGO:
                                        </label>
                                        <p className="text-base sm:text-lg font-bold text-blue-800">
                                            {formData.employee_position}
                                        </p>
                                    </div>
                                )}

                                {/* Estado (solo en edición) */}
                                {editingId && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ESTADO
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                        >
                                            <option value="active">Activa</option>
                                            <option value="returned">Devuelta</option>
                                            <option value="damaged">Dañada</option>
                                        </select>
                                    </div>
                                )}

                                {/* Nota informativa */}
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border-l-4 border-blue-500">
                                    <p className="text-xs sm:text-sm text-gray-700">
                                        <strong>Nota:</strong> La responsiva se generará con la información del equipo,
                                        el empleado receptor y el responsable de sistemas (Gilberto Pérez Sosa).
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors text-sm sm:text-base"
                                >
                                    {editingId ? 'Actualizar Responsiva' : 'Crear Responsiva'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-800 py-2 sm:py-3 rounded-lg hover:bg-gray-300 font-semibold transition-colors text-sm sm:text-base"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Agregar Equipo */}
            {showEquipmentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
                            Agregar Nuevo Equipo
                        </h2>
                        <form onSubmit={handleCreateEquipment}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Equipo *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newEquipment.name}
                                        onChange={(e) => setNewEquipment({ name: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                        placeholder="Ej: LAPTOP"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Este equipo estará disponible para futuras responsivas
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                                >
                                    <Laptop className="w-5 h-5" />
                                    Agregar Equipo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEquipmentModal(false);
                                        setNewEquipment({ name: '' });
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 font-semibold transition-colors text-sm sm:text-base"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Agregar Empleado */}
            {showEmployeeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
                            Agregar Nuevo Empleado
                        </h2>
                        <form onSubmit={handleCreateEmployee}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newEmployee.full_name}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                        placeholder="Ej: ELIZABETH RODRÍGUEZ MEDINA"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cargo / Puesto *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newEmployee.position}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                        placeholder="Ej: GERENTE DE VENTAS"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Departamento (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={newEmployee.department}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                        placeholder="Ej: Ventas"
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Este empleado estará disponible para futuras responsivas
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    Agregar Empleado
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEmployeeModal(false);
                                        setNewEmployee({ full_name: '', position: '', department: '' });
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 font-semibold transition-colors text-sm sm:text-base"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

