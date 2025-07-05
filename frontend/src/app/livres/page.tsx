'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Star, Calendar, User } from 'lucide-react';
import api from '../../lib/api';
import { Livre, Categorie } from '../../types';

export default function CataloguePage() {
  const [livres, setLivres] = useState<Livre[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [empruntingId, setEmpruntingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    fetchLivres();
    fetchCategories();
  }, []);

  const fetchLivres = async () => {
    try {
      const response = await api.get('/livres');
      setLivres(response.data.livres || []);
    } catch (error) {
      console.error('Erreur lors du chargement des livres:', error);
      setError('Erreur lors du chargement des livres');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const filteredLivres = livres.filter(livre => {
    const matchesSearch = livre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         livre.auteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         livre.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || livre.categorie_id?.toString() === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-secondary-300'
          }`}
        />
      );
    }
    return stars;
  };

  const handleEmprunt = async (livreId: number) => {
    try {
      setEmpruntingId(livreId);
      setErrorMessage('');
      setSuccessMessage('');
      
      await api.post('/emprunts/emprunter', { livre_id: livreId });
      await fetchLivres(); // Rafraîchir la liste des livres
      
      setSuccessMessage('Demande d\'emprunt soumise avec succès ! En attente d\'approbation.');
      setTimeout(() => setSuccessMessage(''), 5000); // Masquer après 5 secondes
      
    } catch (error: any) {
      console.error('Erreur lors de l\'emprunt:', error);
      const message = error.response?.data?.message || 'Erreur lors de la demande d\'emprunt';
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 5000); // Masquer après 5 secondes
    } finally {
      setEmpruntingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Catalogue des Livres
          </h1>
          <p className="text-secondary-600">
            Découvrez notre collection de {livres.length} livres
          </p>
        </div>

        {/* Messages de feedback */}
        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Barre de recherche */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Rechercher par titre, auteur ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtre par catégorie */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-secondary-400" />
              </div>
              <select
                className="block w-full pl-10 pr-10 py-2 border border-secondary-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Toutes les catégories</option>
                {categories.map((categorie) => (
                  <option key={categorie.id} value={categorie.id.toString()}>
                    {categorie.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Résultats */}
        <div className="mb-4">
          <p className="text-secondary-600">
            {filteredLivres.length} livre(s) trouvé(s)
          </p>
        </div>

        {/* Grille des livres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLivres.map((livre) => (
            <div
              key={livre.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image du livre */}
              <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                {livre.image_url ? (
                  <img
                    src={livre.image_url}
                    alt={livre.titre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-16 w-16 text-primary-600" />
                )}
              </div>

              {/* Contenu */}
              <div className="p-4">
                <h3 className="font-semibold text-secondary-900 mb-1 line-clamp-2">
                  {livre.titre}
                </h3>
                
                <div className="flex items-center text-sm text-secondary-600 mb-2">
                  <User className="h-4 w-4 mr-1" />
                  <span>{livre.auteur}</span>
                </div>

                {livre.date_publication && (
                  <div className="flex items-center text-sm text-secondary-600 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(livre.date_publication).getFullYear()}</span>
                  </div>
                )}

                {livre.description && (
                  <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
                    {livre.description}
                  </p>
                )}

                {/* Évaluation */}
                {livre.note_moyenne && livre.note_moyenne > 0 && (
                  <div className="flex items-center mb-3">
                    <div className="flex">
                      {renderStars(Math.round(livre.note_moyenne))}
                    </div>
                    <span className="ml-2 text-sm text-secondary-600">
                      ({livre.nombre_notes} avis)
                    </span>
                  </div>
                )}

                {/* Disponibilité */}
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-secondary-600">Disponible: </span>
                    <span className={`font-semibold ${
                      livre.exemplaires_disponibles > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {livre.exemplaires_disponibles}/{livre.nombre_exemplaires}
                    </span>
                  </div>

                  <button
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      livre.exemplaires_disponibles > 0
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-secondary-300 text-secondary-600 cursor-not-allowed'
                    }`}
                    disabled={livre.exemplaires_disponibles === 0 || empruntingId === livre.id}
                    onClick={() => handleEmprunt(livre.id)}
                  >
                    {empruntingId === livre.id ? 'Demande...' : 
                     livre.exemplaires_disponibles > 0 ? 'Emprunter' : 'Indisponible'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLivres.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Aucun livre trouvé
            </h3>
            <p className="text-secondary-600">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
