'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Emprunt } from '../../types';
import ProtectedRoute from '../../components/ProtectedRoute';

function MesEmpruntsContent() {
  const { user } = useAuth();
  const [emprunts, setEmprunts] = useState<Emprunt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchEmprunts();
    }
  }, [user]);

  const fetchEmprunts = async () => {
    try {
      const response = await api.get('/emprunts/mes-emprunts');
      setEmprunts(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des emprunts:', error);
      setError('Erreur lors du chargement des emprunts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetour = async (empruntId: number) => {
    try {
      await api.post('/emprunts/demander-retour', { emprunt_id: empruntId });
      // Rafraîchir la liste
      fetchEmprunts();
    } catch (error) {
      console.error('Erreur lors de la demande de retour:', error);
      setError('Erreur lors de la demande de retour');
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_cours':
        return 'bg-blue-100 text-blue-800';
      case 'retour_demande':
        return 'bg-orange-100 text-orange-800';
      case 'retourne':
        return 'bg-green-100 text-green-800';
      case 'en_retard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return <Clock className="h-4 w-4" />;
      case 'en_cours':
        return <BookOpen className="h-4 w-4" />;
      case 'retour_demande':
        return <AlertTriangle className="h-4 w-4" />;
      case 'retourne':
        return <CheckCircle className="h-4 w-4" />;
      case 'en_retard':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return 'En attente d\'approbation';
      case 'en_cours':
        return 'En cours';
      case 'retour_demande':
        return 'Retour demandé';
      case 'retourne':
        return 'Retourné';
      case 'en_retard':
        return 'En retard';
      default:
        return statut;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isRetardé = (dateRetourPrevue: string, statut: string) => {
    if (statut === 'retourne') return false;
    return new Date(dateRetourPrevue) < new Date();
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
            Mes Emprunts
          </h1>
          <p className="text-secondary-600">
            Gérez vos livres empruntés et suivez vos dates de retour
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-secondary-900">
                  Emprunts actifs
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {emprunts.filter(e => e.statut === 'en_cours').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-secondary-900">
                  Livres retournés
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {emprunts.filter(e => e.statut === 'retourne').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-secondary-900">
                  En retard
                </h3>
                <p className="text-2xl font-bold text-red-600">
                  {emprunts.filter(e => e.statut === 'en_retard' || 
                    isRetardé(e.date_retour_prevue, e.statut)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des emprunts */}
        {emprunts.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">
                Historique des emprunts
              </h3>
              
              <div className="space-y-4">
                {emprunts.map((emprunt) => (
                  <div
                    key={emprunt.id}
                    className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <BookOpen className="h-5 w-5 text-primary-600" />
                          <h4 className="text-lg font-medium text-secondary-900">
                            {emprunt.livre?.titre}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(emprunt.statut)}`}>
                            {getStatusIcon(emprunt.statut)}
                            <span className="ml-1">{getStatusText(emprunt.statut)}</span>
                          </span>
                        </div>
                        
                        <p className="text-secondary-600 mb-2">
                          par {emprunt.livre?.auteur}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-secondary-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Emprunté le {formatDate(emprunt.date_emprunt)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className={`${
                              isRetardé(emprunt.date_retour_prevue, emprunt.statut) 
                                ? 'text-red-600 font-medium' 
                                : ''
                            }`}>
                              Retour prévu le {formatDate(emprunt.date_retour_prevue)}
                            </span>
                          </div>

                          {emprunt.date_retour_effective && (
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              <span>Retourné le {formatDate(emprunt.date_retour_effective)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {emprunt.statut === 'en_cours' && (
                        <button
                          onClick={() => handleRetour(emprunt.id)}
                          className="ml-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                        >
                          Demander le retour
                        </button>
                      )}
                      
                      {emprunt.statut === 'retour_demande' && (
                        <div className="ml-4 px-4 py-2 bg-orange-100 text-orange-800 rounded-md">
                          Retour en attente de validation
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Aucun emprunt
            </h3>
            <p className="text-secondary-600 mb-6">
              Vous n'avez pas encore emprunté de livres
            </p>
            <a
              href="/livres"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Parcourir le catalogue
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MesEmpruntsPage() {
  return (
    <ProtectedRoute>
      <MesEmpruntsContent />
    </ProtectedRoute>
  );
}
