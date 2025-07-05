'use client';
import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/api';
import { BookOpen, User, Calendar, CheckCircle, X, Clock } from 'lucide-react';

interface EmpruntEnAttente {
  id: number;
  livre_titre: string;
  livre_auteur: string;
  user_nom: string;
  user_prenom: string;
  user_email: string;
  date_emprunt: string;
  date_retour_prevue: string;
  created_at: string;
}

export default function EmpruntsEnAttentePage() {
  const [emprunts, setEmprunts] = useState<EmpruntEnAttente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadEmprunts();
  }, []);

  const loadEmprunts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/emprunts/admin/en-attente');
      setEmprunts(response.data);
    } catch (err: any) {
      console.error('Erreur chargement emprunts:', err);
      setError('Erreur lors du chargement des emprunts en attente');
    } finally {
      setLoading(false);
    }
  };

  const handleApprouver = async (id: number) => {
    setProcessingId(id);
    try {
      await api.post(`/emprunts/admin/approuver/${id}`);
      await loadEmprunts(); // Recharger la liste
    } catch (err: any) {
      console.error('Erreur approbation emprunt:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'approbation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejeter = async (id: number) => {
    setProcessingId(id);
    try {
      await api.post(`/emprunts/admin/rejeter/${id}`);
      await loadEmprunts(); // Recharger la liste
    } catch (err: any) {
      console.error('Erreur rejet emprunt:', err);
      setError(err.response?.data?.message || 'Erreur lors du rejet');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Emprunts en attente d'approbation
            </h1>
            <p className="text-gray-600">
              Gérez les demandes d'emprunt des étudiants
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : emprunts.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun emprunt en attente</h3>
              <p className="mt-1 text-sm text-gray-500">
                Toutes les demandes d'emprunt ont été traitées.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {emprunts.map((emprunt) => (
                  <li key={emprunt.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <BookOpen className="h-10 w-10 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {emprunt.livre_titre}
                            </p>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              En attente
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">par {emprunt.livre_auteur}</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            <span>{emprunt.user_prenom} {emprunt.user_nom}</span>
                            <span className="mx-2">•</span>
                            <span>{emprunt.user_email}</span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            <span>Demande faite le {formatDate(emprunt.created_at)}</span>
                            <span className="mx-2">•</span>
                            <span>Retour prévu le {formatDate(emprunt.date_retour_prevue)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprouver(emprunt.id)}
                          disabled={processingId === emprunt.id}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {processingId === emprunt.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approuver
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRejeter(emprunt.id)}
                          disabled={processingId === emprunt.id}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          {processingId === emprunt.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Rejeter
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
