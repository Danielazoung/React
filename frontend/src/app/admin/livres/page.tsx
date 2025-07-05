'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminLayout from '../../../components/AdminLayout';
import { Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';
import api from '../../../lib/api';
import { Livre, Categorie } from '../../../types';
import toast from 'react-hot-toast';

export default function AdminLivresPage() {
  const [livres, setLivres] = useState<Livre[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [livreToDelete, setLivreToDelete] = useState<Livre | null>(null);
  const [livreToEdit, setLivreToEdit] = useState<Livre | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    auteur: '',
    ISBN: '',
    description: '',
    categorie_id: '',
    nombre_exemplaires: 1,
    emplacement: ''
  });

  useEffect(() => {
    fetchLivres();
    fetchCategories();
  }, []);

  const fetchLivres = async () => {
    try {
      const response = await api.get('/livres');
      // L'API renvoie { livres: [...], pagination: {...} }
      setLivres(response.data.livres || response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des livres');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories');
    }
  };

  const handleDeleteLivre = async () => {
    if (!livreToDelete) return;

    try {
      await api.delete(`/livres/${livreToDelete.id}`);
      // S'assurer que livres est un tableau avant de filtrer
      setLivres(Array.isArray(livres) ? livres.filter(livre => livre.id !== livreToDelete.id) : []);
      toast.success('Livre supprimé avec succès');
      setShowDeleteModal(false);
      setLivreToDelete(null);
    } catch (error) {
      toast.error('Erreur lors de la suppression du livre');
    }
  };

  const handleAddLivre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/livres', {
        ...formData,
        categorie_id: parseInt(formData.categorie_id),
        exemplaires_disponibles: formData.nombre_exemplaires
      });
      
      // Recharger la liste complète des livres
      await fetchLivres();
      
      toast.success('Livre ajouté avec succès');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du livre');
    }
  };

  const handleEditLivre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!livreToEdit) return;

    try {
      await api.put(`/livres/${livreToEdit.id}`, {
        ...formData,
        categorie_id: parseInt(formData.categorie_id)
      });
      
      // Recharger la liste complète des livres
      await fetchLivres();
      
      toast.success('Livre modifié avec succès');
      setShowEditModal(false);
      setLivreToEdit(null);
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de la modification du livre');
    }
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      auteur: '',
      ISBN: '',
      description: '',
      categorie_id: '',
      nombre_exemplaires: 1,
      emplacement: ''
    });
  };

  const openEditModal = (livre: Livre) => {
    setLivreToEdit(livre);
    setFormData({
      titre: livre.titre,
      auteur: livre.auteur,
      ISBN: livre.ISBN || '',
      description: livre.description || '',
      categorie_id: livre.categorie_id?.toString() || '',
      nombre_exemplaires: livre.nombre_exemplaires,
      emplacement: ''
    });
    setShowEditModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'nombre_exemplaires' ? parseInt(value) || 1 : value
    }));
  };

  const filteredLivres = Array.isArray(livres) ? livres.filter(livre => {
    const matchesSearch = (livre.titre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (livre.auteur?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || livre.categorie_id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  }) : [];

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <AdminLayout>
          <div className="p-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Livres</h1>
              <p className="mt-2 text-gray-600">Gérez votre collection de livres</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un livre
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Rechercher par titre ou auteur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span>{filteredLivres.length} livre(s) trouvé(s)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Books Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Livre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auteur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exemplaires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disponibles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLivres.map((livre) => (
                    <tr key={livre.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-500 font-medium text-sm">
                                {livre.titre.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{livre.titre}</div>
                            <div className="text-sm text-gray-500">ISBN: {livre.ISBN || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {livre.auteur}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {categories.find(c => c.id === livre.categorie_id)?.nom || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {livre.nombre_exemplaires}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          livre.exemplaires_disponibles > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {livre.exemplaires_disponibles}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal(livre)}
                            className="text-yellow-600 hover:text-yellow-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setLivreToDelete(livre);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredLivres.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun livre trouvé</p>
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">Confirmer la suppression</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Êtes-vous sûr de vouloir supprimer le livre "{livreToDelete?.titre}" ? 
                    Cette action est irréversible.
                  </p>
                </div>
                <div className="flex justify-center space-x-4 px-4 py-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteLivre}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-96 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter un nouveau livre</h3>
                <form onSubmit={handleAddLivre} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Titre</label>
                    <input
                      type="text"
                      name="titre"
                      value={formData.titre}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Auteur</label>
                    <input
                      type="text"
                      name="auteur"
                      value={formData.auteur}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ISBN</label>
                    <input
                      type="text"
                      name="ISBN"
                      value={formData.ISBN}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                    <select
                      name="categorie_id"
                      value={formData.categorie_id}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id.toString()}>
                          {category.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre d'exemplaires</label>
                    <input
                      type="number"
                      name="nombre_exemplaires"
                      value={formData.nombre_exemplaires}
                      onChange={handleFormChange}
                      min="1"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white text-base font-medium rounded-md hover:bg-primary-700"
                    >
                      Ajouter
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-96 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Modifier le livre</h3>
                <form onSubmit={handleEditLivre} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Titre</label>
                    <input
                      type="text"
                      name="titre"
                      value={formData.titre}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Auteur</label>
                    <input
                      type="text"
                      name="auteur"
                      value={formData.auteur}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ISBN</label>
                    <input
                      type="text"
                      name="ISBN"
                      value={formData.ISBN}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                    <select
                      name="categorie_id"
                      value={formData.categorie_id}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id.toString()}>
                          {category.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre d'exemplaires</label>
                    <input
                      type="number"
                      name="nombre_exemplaires"
                      value={formData.nombre_exemplaires}
                      onChange={handleFormChange}
                      min="1"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setLivreToEdit(null);
                        resetForm();
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white text-base font-medium rounded-md hover:bg-primary-700"
                    >
                      Modifier
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
